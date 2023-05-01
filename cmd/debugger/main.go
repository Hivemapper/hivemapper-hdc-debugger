package main

import (
	"fmt"
	"github.com/spf13/cobra"
	"os"
)

var RootCmd = &cobra.Command{
	Use:   "preview",
	Short: "start preview to start an http server and/or a file watcher",
}

func main() {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}
