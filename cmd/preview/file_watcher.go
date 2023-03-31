package main

import (
	"fmt"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/spf13/cobra"
	"os"
	"path/filepath"
	"strings"
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
	path := args[0]

	files, err := os.ReadDir(path)
	if err != nil {
		return fmt.Errorf("could not read %s: %w", path, err)
	}

	var jpegFileInfos []*JPEGFileInfo

	for _, file := range files {
		if !strings.Contains(file.Name(), ".jpg") {
			continue
		}

		f, err := os.Open(filepath.Join(path, file.Name()))
		if err != nil {
			return fmt.Errorf("file %s does not exist: %w", file.Name(), err)
		}

		fileInfo, err := file.Info()

		if err != nil {
			return fmt.Errorf("getting file size %s: %w", file.Name(), err)
		}

		jpegFileInfo, err := extractJpegFileInfo(f)
		if err != nil {
			return fmt.Errorf("extracting jpef file info for %s: %w", file.Name(), err)
		}

		jpegFileInfo.fileSize = fileInfo.Size()

		fmt.Println("jpegFileInfo", jpegFileInfo)

		jpegFileInfos = append(jpegFileInfos, jpegFileInfo)
	}

	fmt.Println(jpegFileInfos)

	return nil
}

func extractJpegFileInfo(file *os.File) (*JPEGFileInfo, error) {
	x, err := exif.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("decoding exif data for %s: %w", file.Name(), err)
	}

	return &JPEGFileInfo{
		xResolution: extractExifDataPoint(x, exif.XResolution),
		yResolution: extractExifDataPoint(x, exif.YResolution),
		imageWidth:  extractExifDataPoint(x, exif.ImageWidth),
		imageHeight: extractExifDataPoint(x, exif.ImageLength),
	}, nil
}

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
