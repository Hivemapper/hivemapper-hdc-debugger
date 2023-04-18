package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type Dop struct {
	Gdop float64 `json:"gdop"`
	Hdop float64 `json:"hdop"`
	Pdop float64 `json:"pdop"`
	Tdop float64 `json:"tdop"`
	Vdop float64 `json:"vdop"`
	Xdop any     `json:"xdop"`
	Ydop any     `json:"ydop"`
}

type Satellites struct {
	Seen int64 `json:"seen"`
	Used int64 `json:"used"`
}
type GPSState struct {
	Dop        *Dop        `json:"dop"`
	Satellites *Satellites `json:"satellites"`
	Fix        string      `json:"fix"`
	Systemtime time.Time   `json:"systemtime"`
	Timestamp  time.Time   `json:"timestamp"`
}

type Average struct {
	Count int
	Sum   float64
	Value float64
	Ts    time.Time
}

type GPSStats struct {
	gpsAverageDOPs map[string]map[string]*Average
	lock           sync.Mutex
}

func NewGPSStats() *GPSStats {
	gpsAverageDOPs := make(map[string]map[string]*Average)
	gpsAverageDOPs["gdop"] = make(map[string]*Average)
	gpsAverageDOPs["hdop"] = make(map[string]*Average)
	gpsAverageDOPs["pdop"] = make(map[string]*Average)
	gpsAverageDOPs["tdop"] = make(map[string]*Average)
	gpsAverageDOPs["vdop"] = make(map[string]*Average)
	gpsAverageDOPs["sat_seen"] = make(map[string]*Average)
	gpsAverageDOPs["sat_used"] = make(map[string]*Average)

	return &GPSStats{
		gpsAverageDOPs: gpsAverageDOPs,
	}
}

func (g *GPSStats) Init(gpsDataPath string) error {
	//list all files in gpsDataPath
	files, err := os.ReadDir(gpsDataPath)
	if err != nil {
		return fmt.Errorf("reading gps data path: %w", err)
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}
		filePath := filepath.Join(gpsDataPath, file.Name())
		if strings.HasSuffix(filePath, ".json") {
			err := g.processFile(filePath)
			if err != nil {
				return fmt.Errorf("processing file: %w", err)
			}
		}
	}
	return nil
}

func (g *GPSStats) processFile(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("openning file: %w", err)
	}

	data, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("reading file: %w", err)
	}

	if len(data) == 0 {
		return nil
	}
	var states []*GPSState
	err = json.Unmarshal(data, &states)
	if err != nil {
		return fmt.Errorf("unmarshalling file: %s, %w", filePath, err)
	}

	for _, state := range states {
		key := state.Systemtime.Format("2006-01-02 15:04")
		if state.Fix != "None" {
			g.updateAverage("gdop", state.Dop.Gdop, key, state.Systemtime)
			g.updateAverage("hdop", state.Dop.Hdop, key, state.Systemtime)
			g.updateAverage("pdop", state.Dop.Pdop, key, state.Systemtime)
			g.updateAverage("tdop", state.Dop.Tdop, key, state.Systemtime)
			g.updateAverage("vdop", state.Dop.Tdop, key, state.Systemtime)
			if state.Satellites != nil {
				g.updateAverage("sat_seen", float64(state.Satellites.Seen), key, state.Systemtime)
				g.updateAverage("sat_used", float64(state.Satellites.Used), key, state.Systemtime)
			}
		}
	}

	return nil
}

func (g *GPSStats) purgeOldAverages() {
	g.lock.Lock()
	defer g.lock.Unlock()

	for statName, averages := range g.gpsAverageDOPs {
		for key, average := range averages {
			if time.Since(average.Ts) > time.Duration(2)*time.Hour {
				delete(g.gpsAverageDOPs[statName], key)
			}
		}
	}
}

func (g *GPSStats) updateAverage(statName string, value float64, key string, ts time.Time) {
	g.lock.Lock()
	defer g.lock.Unlock()
	if value == 99.99 {
		value = 0
	}
	average, ok := g.gpsAverageDOPs[statName][key]
	if !ok {
		average = &Average{
			Ts:    ts,
			Count: 1,
			Sum:   value,
			Value: value,
		}
		g.gpsAverageDOPs[statName][key] = average
		return
	}

	average.Count++
	average.Sum += value
	average.Value = average.Sum / float64(average.Count)
	//fmt.Println("average", statName, average.Value, average.Count, average.Sum)
}

func (g *GPSStats) ToSortedStats() map[string][]*Average {
	//g.purgeOldAverages()
	g.lock.Lock()
	defer g.lock.Unlock()

	stats := make(map[string][]*Average)
	for statName, averages := range g.gpsAverageDOPs {
		values := make([]*Average, 0, len(averages))
		for _, value := range averages {
			values = append(values, value)
		}

		sort.Slice(values, func(i, j int) bool {
			return values[i].Ts.Before(values[j].Ts)
		})
		//fmt.Println("statName", statName, values[0].Value)
		stats[statName] = values
	}
	return stats
}
