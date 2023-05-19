package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"

	"github.com/dustin/go-humanize"
	"github.com/mackerelio/go-osstat/cpu"
	"github.com/mackerelio/go-osstat/memory"
)

var top *Top
var frameStats *FrameStats

func init() {
	go func() {
		for {
			memStats, err := memory.Get()
			if err != nil {
				println(err)
				return
			}

			before, err := cpu.Get()
			if err != nil {
				println(err)
				return
			}
			time.Sleep(time.Duration(1) * time.Second)
			after, err := cpu.Get()
			if err != nil {
				println(err)
				return
			}
			total := float64(after.Total - before.Total)

			top = &Top{
				FrameStats: frameStats,
				Memory: &Memory{
					Total:     humanize.IBytes(memStats.Total),
					Used:      humanize.IBytes(memStats.Used),
					Cached:    humanize.IBytes(memStats.Cached),
					Free:      humanize.IBytes(memStats.Free),
					Active:    humanize.IBytes(memStats.Active),
					Inactive:  humanize.IBytes(memStats.Inactive),
					SwapTotal: humanize.IBytes(memStats.SwapTotal),
					SwapUsed:  humanize.IBytes(memStats.SwapUsed),
					SwapFree:  humanize.IBytes(memStats.SwapFree),
				},
				CPU: &CPU{
					User:   float64(after.User-before.User) / total * 100,
					System: float64(after.System-before.System) / total * 100,
					Idle:   float64(after.Idle-before.Idle) / total * 100,
					Nice:   float64(after.Nice-before.Nice) / total * 100,
					Total:  float64(after.Total-before.Total) / total * 100,
				},
			}
			time.Sleep(1 * time.Second)
		}
	}()

	go func() {
		for {
			time.Sleep(5 * time.Second)
			frameStats.Framerate = frameStats.frameCount / 5

			if frameStats.frameCount > 0 {
				frameStats.FrameAverageSize = frameStats.frameSizeSum / frameStats.frameCount
			}
			frameStats.frameCount = 0
			frameStats.frameSizeSum = 0
		}
	}()
}

type Frame struct {
	Filename string
	Size     int64
	Ts       time.Time
}

type Api struct {
	filePathChannel chan string
	lastFrame       *Frame
	imagesPath      string
	gpsPath         string
	grabPath        string
	gpsStats        *GPSStats
	bridgeCmd       *exec.Cmd
	watcher         *fsnotify.Watcher
}

func NewApi(imagesPath string, gpsPath string, grabPath string) *Api {
	api := &Api{
		imagesPath:      imagesPath,
		gpsPath:         gpsPath,
		grabPath:        grabPath,
		filePathChannel: make(chan string),
	}

	frameStats = &FrameStats{}

	go func() {
		for {
			select {
			case filePath := <-api.filePathChannel:
				if stat, err := os.Stat(filePath); err == nil {
					//fmt.Println("filePath:", filePath)
					if strings.Contains(filePath, "gps") && strings.HasSuffix(filePath, ".json") {
						fmt.Println("gpsStats.processFile:", filePath, err)
						err = api.gpsStats.processFile(filePath)
						continue
					}

					frameStats.frameCount++
					frameStats.FrameTotalCount++
					frameStats.frameSizeSum += stat.Size()

					if api.lastFrame == nil || time.Since(api.lastFrame.Ts) > 500*time.Millisecond {
						api.lastFrame = &Frame{
							Filename: stat.Name(),
							Size:     stat.Size(),
							Ts:       time.Now(),
						}
					}
				} else {
					log.Fatal("File does not exist")
				}
			}
		}
	}()

	return api
}

type Top struct {
	FrameStats *FrameStats
	Memory     *Memory
	CPU        *CPU
}

type FrameStats struct {
	Framerate        int64
	FrameAverageSize int64
	FrameTotalCount  int64

	frameCount   int64
	frameSizeSum int64
}
type Memory struct {
	Total, Used, Cached, Free, Active, Inactive, SwapTotal, SwapUsed, SwapFree string
}
type CPU struct {
	User, System, Idle, Nice, Total float64
}

func (a *Api) StartWatching(w http.ResponseWriter, _ *http.Request) {
	if a.watcher != nil {
		_, _ = w.Write([]byte("Already watching"))
		return
	}

	var err error
	a.watcher, err = fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("NewWatcher failed: ", err)
	}

	go func() {
		for {
			select {
			case event, ok := <-a.watcher.Events:
				if !ok {
					return
				}
				if event.Op == fsnotify.Create {
					if strings.HasSuffix(event.Name, "jpg") || strings.HasSuffix(event.Name, "json") {
						a.filePathChannel <- event.Name
					}
				}
			case err, ok := <-a.watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
		}

	}()

	fmt.Printf("About to watch imagesPath: %s\n", a.imagesPath)
	err = a.watcher.Add(a.imagesPath)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	err = a.watcher.Add(a.gpsPath)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
	a.gpsStats = NewGPSStats()
	err = a.gpsStats.Init(a.gpsPath)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	cmd := exec.Command("systemctl", "stop", "camera-node")
	fmt.Println("stopping camera-node", cmd)
	err = cmd.Start()
	if err != nil {
		fmt.Println("command error:", err)
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	cmd = exec.Command("systemctl", "stop", "camera-bridge")
	fmt.Println("stopping camera-bridge", cmd)
	err = cmd.Start()
	if err != nil {
		fmt.Println("command error:", err)
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
}

func (a *Api) Top(w http.ResponseWriter, _ *http.Request) {
	if top == nil {
		return
	}
	data, err := json.Marshal(top)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	w.Header().Add("content-type", "application/json")
	_, _ = w.Write(data)
}

func (a *Api) GPS(w http.ResponseWriter, _ *http.Request) {
	if a.gpsStats == nil {
		return
	}
	data, err := json.Marshal(a.gpsStats.ToSortedStats())
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	w.Header().Add("content-type", "application/json")
	_, _ = w.Write(data)
}

func (a *Api) GetJPG(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	pathElems := strings.Split(path, "/")
	filename := pathElems[len(pathElems)-1]

	f, err := os.Open(filepath.Join(a.imagesPath, filename))
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
	data, err := io.ReadAll(f)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	w.Header().Add("content-type", "image/jpeg")
	_, _ = w.Write(data)
}

func (a *Api) GetGrabJPG(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	pathElems := strings.Split(path, "/")
	filename := pathElems[len(pathElems)-1]

	fmt.Println("GetGrabJPG:", filename)
	f, err := os.Open(filepath.Join(a.grabPath, filename))
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
	data, err := io.ReadAll(f)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
	//fmt.Println("GetGrabJPG:", data)
	w.Header().Add("content-type", "image/jpeg")
	_, _ = w.Write(data)
}

func (a *Api) GetLastFrame(w http.ResponseWriter, _ *http.Request) {
	if a.lastFrame != nil {
		data, err := json.Marshal(a.lastFrame)
		if err != nil {
			w.WriteHeader(500)
			_, _ = w.Write([]byte(err.Error()))
			return
		}
		w.Header().Add("content-type", "application/json")
		_, _ = w.Write(data)
	}
}

func (a *Api) CopyJPG(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	pathElems := strings.Split(path, "/")
	filename := pathElems[len(pathElems)-1]

	if !strings.HasSuffix(filename, ".jpg") {
		w.WriteHeader(500)
		_, _ = w.Write([]byte("not a jpg file"))
		return
	}

	sourceFilePath := filepath.Join(a.imagesPath, pathElems[len(pathElems)-1])

	sourceFile, err := os.Open(sourceFilePath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	defer func(sourceFile *os.File) {
		_ = sourceFile.Close()
	}(sourceFile)

	err = os.MkdirAll(a.grabPath, os.ModePerm)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	destinationFile := filepath.Join(a.grabPath, filename)
	fmt.Println("destinationFile:", destinationFile)

	data, err := io.ReadAll(sourceFile)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	err = os.WriteFile(destinationFile, data, 0644)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	jsonFilename := strings.Replace(filename, ".jpg", ".json", 1)

	data, err = json.Marshal(a.bridgeCmd.Args)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	err = os.WriteFile(filepath.Join(a.grabPath, jsonFilename), data, 0644)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	w.WriteHeader(200)
	_, _ = w.Write([]byte("Copied!"))
}

func (a *Api) RestartBridge(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		_, _ = w.Write([]byte("method supported: POST"))
		w.WriteHeader(500)
		return
	}

	data, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
	fmt.Println("data:", string(data))

	config := make(map[string]string)
	err = json.Unmarshal(data, &config)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	args := []string{
		"--config", "/opt/dashcam/bin/camera_config.json",
		"--segment", "0",
		"--timeout", "0",
		"--tuning-file", "/opt/dashcam/bin/imx477.json",
	}

	for k, V := range config {
		args = append(args, "--"+k)
		args = append(args, V)
	}

	if a.bridgeCmd != nil {
		err := a.bridgeCmd.Process.Kill()
		if err != nil {
			w.WriteHeader(500)
			_, _ = w.Write([]byte(err.Error()))
			return
		}
	}

	cmd := exec.Command("/opt/dashcam/bin/libcamera-bridge", args...)

	fmt.Println("command", cmd)

	err = cmd.Start()
	if err != nil {
		fmt.Println("command error:", err)
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	a.bridgeCmd = cmd
	w.WriteHeader(200)
}

func (a *Api) StopBridge(w http.ResponseWriter, _ *http.Request) {
	if a.bridgeCmd != nil {
		err := a.bridgeCmd.Process.Kill()
		if err != nil {
			w.WriteHeader(500)
			_, _ = w.Write([]byte(err.Error()))
			return
		}
	}
	a.bridgeCmd = nil
	w.WriteHeader(200)
}

type grabbedFile struct {
	Name string            `json:"name"`
	Args map[string]string `json:"args"`
}

func (a *Api) GetGrabbed(w http.ResponseWriter, _ *http.Request) {
	files, err := os.ReadDir(a.grabPath)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	grabs := map[string]grabbedFile{}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if strings.HasSuffix(file.Name(), ".jpg") {
			jsonFilename := strings.Replace(file.Name(), ".jpg", ".json", 1)
			data, err := os.ReadFile(filepath.Join(a.grabPath, jsonFilename))
			if err != nil {
				w.WriteHeader(500)
				_, _ = w.Write([]byte(err.Error()))
				return
			}

			var args []string
			err = json.Unmarshal(data, &args)
			if err != nil {
				w.WriteHeader(500)
				_, _ = w.Write([]byte(err.Error()))
				return
			}
			argsMap := map[string]string{}

			for i := 0; i < len(args); i += 1 {
				if strings.HasPrefix(args[i], "--") {
					a := strings.TrimPrefix(args[i], "--")
					if !strings.HasPrefix(args[i+1], "--") {
						argsMap[a] = args[i+1]
						i += 1
						continue
					}
					argsMap[a] = ""
				}
			}

			g := grabbedFile{
				Name: file.Name(),
				Args: argsMap,
			}
			grabs[file.Name()] = g
		}
	}

	data, err := json.Marshal(grabs)
	if err != nil {
		w.WriteHeader(500)
		_, _ = w.Write([]byte(err.Error()))
		return
	}
	w.Header().Add("content-type", "application/json")
	_, _ = w.Write(data)
}
