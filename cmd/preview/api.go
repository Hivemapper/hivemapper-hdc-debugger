package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
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
					if api.lastFrame == nil || time.Since(api.lastFrame.Ts) > 1*time.Second {
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
	fmt.Println("path", r.URL.Path)
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
