package main

import (
	"encoding/json"
	"github.com/fsnotify/fsnotify"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/spf13/cobra"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

/*
1. create a jpeg-file-watcher which listens on /mnt/data/...
	- this file watcher will aggregate states and send them out every second
	- we want the number of file per seconds that are saved
	- we want the stats of an image every second
		-> exif information
		-> resolution of the image
		-> and whatever else which would be interesting to have

	- file per seconds that are saved
	- stats of an image every second
*/

var fileWatcherCmd = &cobra.Command{
	Use:   "watch {path}",
	Short: "watch file stats for a folder",
	RunE:  watchRunE,
	Args:  cobra.ExactArgs(1),
}

func init() {
	RootCmd.AddCommand(fileWatcherCmd)
}

func watchRunE(cmd *cobra.Command, args []string) error {
	if len(args) == 0 {
		log.Fatal("missing folder argument")
	}
	folder := os.Args[1]

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("NewWatcher failed: ", err)
	}
	defer watcher.Close()

	done := make(chan bool)
	newFiles := make(chan string)
	go func() {
		defer close(done)

		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Op == fsnotify.Create {
					if strings.HasSuffix(event.Name, "jpg") {
						newFiles <- event.Name
					}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
		}

	}()

	println("About to watch folder:", folder)
	err = watcher.Add(folder)
	if err != nil {
		log.Fatal("Add failed:", err)
	}

	listenAddr := mustGetString(cmd, "listen-addr")

	//todo: setup handler and route

	log.Println("Starting jpeg preview on", listenAddr)
	if err := http.ListenAndServe(listenAddr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}

	return nil

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
	newFiles  chan string
	lastFrame *Frame
}

func NewApi(newFilenames chan string) *Api {
	api := &Api{
		newFiles: newFilenames,
	}

	go func() {
		for {
			select {
			case filename := <-newFilenames:
				if stat, err := os.Stat(filename); err == nil {
					if api.lastFrame == nil || time.Since(api.lastFrame.Ts) > 1*time.Second {
						api.lastFrame = &Frame{
							Filename: filename,
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

func (a *Api) GetLastFrameInfo(w http.ResponseWriter, r *http.Request) {
	//todo: extract filename from url
	f, err := os.Open("filename")
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

func (a *Api) GetLastFrameJpg(w http.ResponseWriter, r *http.Request) {

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

//func extractJpegFileInfo(file *os.File) (*JPEGFileInfo, error) {
//	x, err := exif.Decode(file)
//	if err != nil {
//		return nil, fmt.Errorf("decoding exif data for %s: %w", file.Name(), err)
//	}
//
//	return &JPEGFileInfo{
//		xResolution: extractExifDataPoint(x, exif.XResolution),
//		yResolution: extractExifDataPoint(x, exif.YResolution),
//		imageWidth:  extractExifDataPoint(x, exif.ImageWidth),
//		imageHeight: extractExifDataPoint(x, exif.ImageLength),
//	}, nil
//}

func extractExifDataPoint(x *exif.Exif, fieldName exif.FieldName) string {
	exifInfo, _ := x.Get(fieldName)
	return exifInfo.String()
}

type JPEGFileInfo struct {
	xResolution string
	yResolution string
	imageWidth  string
	imageHeight string
	fileSize    int64
}
