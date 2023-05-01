package main

import (
	"embed"
	_ "embed"
	"fmt"
	"net/http"
	"os"

	"github.com/spf13/cobra"
)

//go:embed www/*
var content embed.FS

var fileWatcherCmd = &cobra.Command{
	Use:   "watch {images-imagesPath} {gps-imagesPath} {grab-Path}",
	Short: "watch file stats for a folder",
	RunE:  watchRunE,
	Args:  cobra.ExactArgs(3),
}

func init() {
	fileWatcherCmd.Flags().String("listen-addr", ":3333", "start http server on port 3333 by defult")
	RootCmd.AddCommand(fileWatcherCmd)
}

func watchRunE(cmd *cobra.Command, args []string) error {
	imagesPath := args[0]
	gpsPath := args[1]
	grabPath := args[2]

	fmt.Println("watchRunE: ", imagesPath, gpsPath)

	api := NewApi(imagesPath, gpsPath, grabPath)

	listenAddr := mustGetString(cmd, "listen-addr")

	if os.Getenv("DEBUG") == "true" {
		http.Handle("/www/", http.StripPrefix("/www/", http.FileServer(http.Dir("./cmd/preview/www/"))))
	} else {
		http.Handle("/www/", http.FileServer(http.FS(content)))
	}

	http.HandleFunc("/lastframe", api.GetLastFrame)
	http.HandleFunc("/framejpg/", api.GetJPG)
	http.HandleFunc("/grabbedjpg/", api.GetGrabJPG)
	http.HandleFunc("/copy/", api.CopyJPG)
	http.HandleFunc("/grabbed", api.GetGrabbed)
	http.HandleFunc("/camera/restart", api.RestartBridge)
	http.HandleFunc("/camera/stop", api.StopBridge)
	http.HandleFunc("/start_watching", api.StartWatching)
	http.HandleFunc("/top", api.Top)
	http.HandleFunc("/gps", api.GPS)

	fmt.Printf("Starting jpeg preview on %s\n", listenAddr)
	if err := http.ListenAndServe(listenAddr, nil); err != nil {
		return fmt.Errorf("ListenAndServe: %w\n", err)
	}

	return nil

}