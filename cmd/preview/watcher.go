package main

import (
	_ "embed"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/spf13/cobra"
	"log"
	"net/http"
	"strings"
)

//go:embed index.html
var index string

var fileWatcherCmd = &cobra.Command{
	Use:   "watch {path}",
	Short: "watch file stats for a folder",
	RunE:  watchRunE,
	Args:  cobra.ExactArgs(1),
}

func init() {
	fileWatcherCmd.Flags().String("listen-addr", ":3333", "start http server on port 3333 by defult")
	RootCmd.AddCommand(fileWatcherCmd)
}

func watchRunE(cmd *cobra.Command, args []string) error {
	folder := args[0]

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("NewWatcher failed: ", err)
	}
	defer watcher.Close()

	done := make(chan bool)
	newFilepaths := make(chan string)
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
						newFilepaths <- event.Name
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

	fmt.Printf("About to watch folder: %s\n", folder)
	err = watcher.Add(folder)
	if err != nil {
		return fmt.Errorf("adding folder %s: %w", folder, err)
	}

	api := NewApi(newFilepaths, folder)

	listenAddr := mustGetString(cmd, "listen-addr")

	http.HandleFunc("/lastframe", api.GetLastFrame)
	http.HandleFunc("/framjpg/{filename}", api.GetJPG)

	fmt.Printf("Starting jpeg preview on %s\n", listenAddr)
	if err := http.ListenAndServe(listenAddr, nil); err != nil {
		return fmt.Errorf("ListenAndServe: %w\n", err)
	}

	return nil

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
