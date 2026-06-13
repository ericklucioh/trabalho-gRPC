package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/erick/projs/trabalho-grpc/internal/adapters/artifacts"
	"github.com/erick/projs/trabalho-grpc/internal/adapters/catalog"
	"github.com/erick/projs/trabalho-grpc/internal/application"
	"github.com/erick/projs/trabalho-grpc/internal/config"
	grpctransport "github.com/erick/projs/trabalho-grpc/internal/transport/grpc"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	service := application.NewService(catalog.NewStaticCatalog(), artifacts.NewFileSystemReader(cfg.ArtifactRoot))
	handler := grpctransport.NewHandler(service)
	server := grpctransport.NewServer(cfg, handler)

	if err := server.Run(ctx); err != nil {
		log.Fatal(err)
	}
}
