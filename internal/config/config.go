package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	GRPCPort        string
	ArtifactRoot    string
	APIVersion      string
	ShutdownTimeout time.Duration
}

func Load() (Config, error) {
	cfg := Config{
		GRPCPort:        getEnv("GRPC_PORT", "50051"),
		ArtifactRoot:    getEnv("ARTIFACT_ROOT", "./artifacts"),
		APIVersion:      getEnv("API_VERSION", "v1"),
		ShutdownTimeout: 5 * time.Second,
	}

	timeoutSeconds, err := strconv.Atoi(getEnv("SHUTDOWN_TIMEOUT_SECONDS", "5"))
	if err != nil {
		return Config{}, fmt.Errorf("invalid SHUTDOWN_TIMEOUT_SECONDS: %w", err)
	}
	cfg.ShutdownTimeout = time.Duration(timeoutSeconds) * time.Second

	if cfg.GRPCPort == "" {
		return Config{}, fmt.Errorf("GRPC_PORT must not be empty")
	}
	if cfg.ArtifactRoot == "" {
		return Config{}, fmt.Errorf("ARTIFACT_ROOT must not be empty")
	}
	if cfg.APIVersion == "" {
		return Config{}, fmt.Errorf("API_VERSION must not be empty")
	}

	return cfg, nil
}

func (c Config) Addr() string {
	return ":" + c.GRPCPort
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
