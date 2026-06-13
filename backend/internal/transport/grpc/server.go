package grpctransport

import (
	"context"
	"fmt"
	"net"

	"github.com/erick/projs/trabalho-grpc/gen/lojinhawasm/v1"
	"github.com/erick/projs/trabalho-grpc/internal/config"
	"google.golang.org/grpc"
)

type Server struct {
	cfg    config.Config
	server *grpc.Server
}

func NewServer(cfg config.Config, handler *Handler) *Server {
	server := grpc.NewServer()
	lojinhawasmv1.RegisterToolCatalogServiceServer(server, handler)

	return &Server{cfg: cfg, server: server}
}

func (s *Server) Run(ctx context.Context) error {
	listener, err := net.Listen("tcp", s.cfg.Addr())
	if err != nil {
		return fmt.Errorf("listen %s: %w", s.cfg.Addr(), err)
	}

	errCh := make(chan error, 1)
	go func() {
		errCh <- s.server.Serve(listener)
	}()

	select {
	case <-ctx.Done():
		s.server.GracefulStop()
		return nil
	case err := <-errCh:
		return err
	}
}
