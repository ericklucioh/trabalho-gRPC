package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/erick/projs/wasm-tool-store/internal/adapters/artifacts"
	"github.com/erick/projs/wasm-tool-store/internal/adapters/catalog"
	"github.com/erick/projs/wasm-tool-store/internal/adapters/logging"
	"github.com/erick/projs/wasm-tool-store/internal/application"
	"github.com/erick/projs/wasm-tool-store/internal/config"
	grpctransport "github.com/erick/projs/wasm-tool-store/internal/transport/grpc"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	stdLogger := log.New(os.Stdout, "wasm-tool-store ", log.LstdFlags|log.Lmicroseconds)
	appLogger := logging.NewStdLogger(stdLogger)
	appLogger.Printf("config loaded grpc_port=%s artifact_root=%s shutdown_timeout=%s", cfg.GRPCPort, cfg.ArtifactRoot, cfg.ShutdownTimeout)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	service := application.NewService(catalog.NewFilesystemCatalog(cfg.ArtifactRoot), artifacts.NewFileSystemReader(cfg.ArtifactRoot))
	handler := grpctransport.NewHandler(service, appLogger)
	server := grpctransport.NewServer(cfg, handler, appLogger)

	if err := server.Run(ctx); err != nil {
		log.Fatal(err)
	}
}
