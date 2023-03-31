package main

import (
	"fmt"
	"github.com/spf13/cobra"
	"io"
	"log"
	"net/http"
)

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "start http server",
	Args:  cobra.ExactArgs(0),
	RunE:  serveRunE,
}

/*
2. create http server which gets the json information from the jpeg-file-watcher
	- small api
	- which will then display the preview of the image with the information fetched
	  from the jpeg-file-watcher

3. We will give the file_watcher to the serve and do a GetLast which would return the last file
   which we have in memory with the information needed
*/

func init() {
	serveCmd.Flags().String("listen-addr", ":3333", "Http server listening on port 3333 by default")

	RootCmd.AddCommand(serveCmd)
}

func serveRunE(cmd *cobra.Command, _ []string) error {
	listenAddr := mustGetString(cmd, "listen-addr")

	log.Println("Starting jpeg preview on", listenAddr)
	if err := http.ListenAndServe(listenAddr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}

	return nil
}

func GetJpegPreview(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("get jpeg preview called"))
}

func GetFolderInformation(picFilename string) error {
	resp, err := http.Get(fmt.Sprintf("http://192.168.0.10:5000/pic/%s", picFilename))
	if err != nil {
		return fmt.Errorf("fetching latest pic %s: %w", picFilename, err)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("reading latest pic %s: %w", picFilename, err)
	}

	defer resp.Body.Close()

	_ = body

	return nil
}
