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
)

type Frame struct {
	Filename string
	Size     int64
	Ts       time.Time
}

type FrameInfo struct {
	Frame *Frame
}

type Api struct {
	newFiles  chan string
	lastFrame *Frame
	path      string
}

func NewApi(newFilenames chan string, path string) *Api {
	api := &Api{
		newFiles: newFilenames,
		path:     path,
	}

	go func() {
		for {
			select {
			case filename := <-newFilenames:
				if stat, err := os.Stat(filename); err == nil {
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

func (a *Api) GetCameraConfig(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("cat", "/Users/eduardvoiculescu/Desktop/mnt/data/opt/dashcam/bin/camera_config.json")
	fmt.Println("command", cmd)
	out, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(out)
	w.WriteHeader(200)
}

func (a *Api) ApplyCameraConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.Write([]byte("method supported: POST"))
		w.WriteHeader(500)
		return
	}

	defer r.Body.Close()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	var cameraConfig *CameraConfig
	err = json.Unmarshal(body, cameraConfig)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(500)
		return
	}

	// todo: take the commands and rerun the camera bridge with the new commands
}

type CameraConfig struct {
	Fps               int     `json:"fps,omitempty"`
	Width             int     `json:"width,omitempty"`
	Height            int     `json:"height,omitempty"`
	Codec             string  `json:"codec,omitempty"`
	Quality           int     `json:"quality,omitempty"`
	CropWidth         int     `json:"crop_width,omitempty"`
	CropHeight        int     `json:"crop_height,omitempty"`
	CropOffsetFromTop int     `json:"crop_offset_from_top,omitempty"`
	Segment           int     `json:"segment,omitempty"`
	Timeout           int     `json:"timeout,omitempty"`
	Brightness        float64 `json:"brightness,omitempty"`
	Sharpness         float64 `json:"sharpness,omitempty"`
	Saturation        float64 `json:"saturation,omitempty"`
	Shutter           int     `json:"shutter,omitempty"`
	Gain              int     `json:"gain,omitempty"`
	Awb               string  `json:"awb,omitempty"`
}

// types of awb
const (
	Auto         string = "auto"
	Incandescent        = "incandescent"
	Tungsten            = "tungsten"
	Fluorescent         = "fluorescent"
	Indoor              = "indoor"
	Daylight            = "daylight"
	Cloudy              = "cloudy"
	Custom              = "custom"
)
