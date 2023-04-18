package main

import (
	_ "embed"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/cobra"
)

//go:embed index.html
var index string

var fileWatcherCmd = &cobra.Command{
	Use:   "watch {images-path} {gps-path}",
	Short: "watch file stats for a folder",
	RunE:  watchRunE,
	Args:  cobra.ExactArgs(2),
}

func init() {
	fileWatcherCmd.Flags().String("listen-addr", ":3333", "start http server on port 3333 by defult")
	RootCmd.AddCommand(fileWatcherCmd)
}

func watchRunE(cmd *cobra.Command, args []string) error {
	imagesPath := args[0]
	gpsPath := args[1]

	fmt.Println("watchRunE: ", imagesPath, gpsPath)

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("NewWatcher failed: ", err)
	}
	defer watcher.Close()

	done := make(chan bool)
	newFilePaths := make(chan string)
	go func() {
		defer close(done)

		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Op == fsnotify.Create {
					if strings.HasSuffix(event.Name, "jpg") || strings.HasSuffix(event.Name, "json") {
						newFilePaths <- event.Name
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

	fmt.Printf("About to watch imagesPath: %s\n", imagesPath)
	err = watcher.Add(imagesPath)
	if err != nil {
		return fmt.Errorf("adding imagesPath %s: %w", imagesPath, err)
	}

	err = watcher.Add(gpsPath)
	if err != nil {
		return fmt.Errorf("adding imagesPath %s: %w", imagesPath, err)
	}
	gpsStats := NewGPSStats()
	err = gpsStats.Init(gpsPath)
	if err != nil {
		return fmt.Errorf("gpsStatsInit: %w", err)
	}

	api := NewApi(newFilePaths, imagesPath, gpsStats)

	listenAddr := mustGetString(cmd, "listen-addr")

	http.HandleFunc("/lastframe", api.GetLastFrame)
	http.HandleFunc("/framejpg/", api.GetJPG)
	http.HandleFunc("/preview", api.FrameHTML)
	http.HandleFunc("/copy/", api.CopyJPG)
	http.HandleFunc("/camera/restart", api.RestartBridge)
	http.HandleFunc("/camera/stop", api.StopBridge)
	//http.HandleFunc("/camera/config/apply", api.ApplyCameraConfig)
	http.HandleFunc("/top", api.Top)
	http.HandleFunc("/gps", api.GPS)

	fmt.Printf("Starting jpeg preview on %s\n", listenAddr)
	if err := http.ListenAndServe(listenAddr, nil); err != nil {
		return fmt.Errorf("ListenAndServe: %w\n", err)
	}

	return nil

}
