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

type FrameInfo struct {
	Frame *Frame
}

type Api struct {
	newFilePath chan string
	lastFrame   *Frame
	path        string
	gpsStats    *GPSStats
	bridgeCmd   *exec.Cmd
}

func NewApi(newFilenames chan string, imagesPath string, gpsStats *GPSStats) *Api {
	api := &Api{
		gpsStats:    gpsStats,
		newFilePath: newFilenames,
		path:        imagesPath,
	}

	frameStats = &FrameStats{}

	go func() {
		for {
			select {
			case filePath := <-newFilenames:
				if stat, err := os.Stat(filePath); err == nil {
					//fmt.Println("filePath:", filePath)
					if strings.Contains(filePath, "gps") && strings.HasSuffix(filePath, ".json") {
						fmt.Println("gpsStats.processFile:", filePath, err)
						err = gpsStats.processFile(filePath)
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

func (a *Api) Top(w http.ResponseWriter, r *http.Request) {
	if top == nil {
		return
	}
	data, err := json.Marshal(top)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	w.Header().Add("content-type", "application/json")
	w.Write(data)
}

func (a *Api) GPS(w http.ResponseWriter, r *http.Request) {
	if a.gpsStats == nil {
		return
	}
	data, err := json.Marshal(a.gpsStats.ToSortedStats())
	if err != nil {
		w.WriteHeader(500)
		return
	}

	w.Header().Add("content-type", "application/json")
	w.Write(data)
}

func (a *Api) GetJPG(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	pathElems := strings.Split(path, "/")
	filename := pathElems[len(pathElems)-1]

	f, err := os.Open(filepath.Join(a.path, filename))
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}
	data, err := io.ReadAll(f)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	w.Header().Add("content-type", "image/jpeg")
	w.Write(data)
}

func (a *Api) GetLastFrame(w http.ResponseWriter, r *http.Request) {
	if a.lastFrame != nil {
		data, err := json.Marshal(a.lastFrame)
		if err != nil {
			w.Write([]byte(err.Error()))
			w.WriteHeader(500)
			return
		}
		w.Header().Add("content-type", "application/json")
		w.Write(data)
	}
}

func (a *Api) FrameHTML(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(index))
}

func (a *Api) CopyJPG(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	pathElems := strings.Split(path, "/")
	filename := pathElems[len(pathElems)-1]
	fullFilename := filepath.Join(a.path, pathElems[len(pathElems)-1])

	source, err := os.Open(fullFilename)
	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte(err.Error()))
		return
	}

	defer source.Close()

	copyFolderPath := filepath.Join("/mnt/data", "/copy")
	err = os.MkdirAll(copyFolderPath, os.ModePerm)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	destinationPath := filepath.Join(copyFolderPath, filename)
	fmt.Println("destinationPath:", destinationPath)

	destination, err := os.Create(destinationPath)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	fmt.Printf("destination %s\n", destination.Name())
	fmt.Printf("source %s\n", source.Name())

	defer destination.Close()
	data, err := io.ReadAll(source)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	err = os.WriteFile(destination.Name(), data, 0644)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	w.Write([]byte("Copied!"))
	w.WriteHeader(200)
}

func (a *Api) RestartBridge(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.Write([]byte("method supported: POST"))
		w.WriteHeader(500)
		return
	}

	data, err := io.ReadAll(r.Body)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}
	fmt.Println("data:", string(data))

	config := make(map[string]string)
	err = json.Unmarshal(data, &config)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
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
			w.Write([]byte(err.Error()))
			w.WriteHeader(500)
			return
		}
	}

	cmd := exec.Command("/opt/dashcam/bin/libcamera-bridge", args...)

	fmt.Println("command", cmd)

	err = cmd.Start()
	if err != nil {
		fmt.Println("command error:", err)
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	a.bridgeCmd = cmd
	w.WriteHeader(200)
}

func (a *Api) StopBridge(w http.ResponseWriter, r *http.Request) {
	if a.bridgeCmd != nil {
		err := a.bridgeCmd.Process.Kill()
		if err != nil {
			w.Write([]byte(err.Error()))
			w.WriteHeader(500)
			return
		}
	}
	a.bridgeCmd = nil
	w.WriteHeader(200)
}

//func (a *Api) GetCameraConfig(w http.ResponseWriter, r *http.Request) {
//	cmd := exec.Command("cat", "/Users/eduardvoiculescu/Desktop/mnt/data/opt/dashcam/bin/camera_config.json")
//	fmt.Println("command", cmd)
//	out, err := cmd.Output()
//	if err != nil {
//		fmt.Println(err)
//		w.Write([]byte(err.Error()))
//		w.WriteHeader(500)
//		return
//	}
//
//	w.Header().Set("Content-Type", "application/json")
//	w.Write(out)
//	w.WriteHeader(200)
//}

//
//func (a *Api) ApplyCameraConfig(w http.ResponseWriter, r *http.Request) {
//	if r.Method != "POST" {
//		w.Write([]byte("method supported: POST"))
//		w.WriteHeader(500)
//		return
//	}
//
//	defer r.Body.Close()
//	body, err := io.ReadAll(r.Body)
//	if err != nil {
//		w.Write([]byte(err.Error()))
//		w.WriteHeader(500)
//		return
//	}
//
//	var cameraConfig *CameraConfig
//	err = json.Unmarshal(body, cameraConfig)
//	if err != nil {
//		w.Write([]byte(err.Error()))
//		w.WriteHeader(500)
//		return
//	}
//
//	// todo: take the commands and rerun the camera bridge with the new commands
//}

//type CameraConfig struct {
//	Fps               int     `json:"fps,omitempty"`
//	Width             int     `json:"width,omitempty"`
//	Height            int     `json:"height,omitempty"`
//	Codec             string  `json:"codec,omitempty"`
//	Quality           int     `json:"quality,omitempty"`
//	CropWidth         int     `json:"crop_width,omitempty"`
//	CropHeight        int     `json:"crop_height,omitempty"`
//	CropOffsetFromTop int     `json:"crop_offset_from_top,omitempty"`
//	Segment           int     `json:"segment,omitempty"`
//	Timeout           int     `json:"timeout,omitempty"`
//	Brightness        float64 `json:"brightness,omitempty"`
//	Sharpness         float64 `json:"sharpness,omitempty"`
//	Saturation        float64 `json:"saturation,omitempty"`
//	Shutter           int     `json:"shutter,omitempty"`
//	Gain              int     `json:"gain,omitempty"`
//	Awb               string  `json:"awb,omitempty"`
//}

//// types of awb
//const (
//	Auto         string = "auto"
//	Incandescent        = "incandescent"
//	Tungsten            = "tungsten"
//	Fluorescent         = "fluorescent"
//	Indoor              = "indoor"
//	Daylight            = "daylight"
//	Cloudy              = "cloudy"
//	Custom              = "custom"
//)
