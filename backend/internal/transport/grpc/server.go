package grpctransport

import (
	"context"
	"fmt"
	"net"

	"github.com/erick/projs/trabalho-grpc/gen/lojinhawasm/v1"
	"github.com/erick/projs/trabalho-grpc/internal/adapters/logging"
	"github.com/erick/projs/trabalho-grpc/internal/config"
	"google.golang.org/grpc"
)

type Server struct {
	cfg    config.Config
	server *grpc.Server
	logger logging.Logger
}

func NewServer(cfg config.Config, handler *Handler, logger logging.Logger) *Server {
	if logger == nil {
		logger = logging.NopLogger{}
	}

	server := grpc.NewServer()
	lojinhawasmv1.RegisterToolCatalogServiceServer(server, handler)

	return &Server{cfg: cfg, server: server, logger: logger}
}

func (s *Server) Run(ctx context.Context) error {
	s.logger.Printf("grpc server starting addr=%s artifact_root=%s", s.cfg.Addr(), s.cfg.ArtifactRoot)

	listener, err := net.Listen("tcp", s.cfg.Addr())
	if err != nil {
		s.logger.Printf("grpc server listen failed addr=%s err=%v", s.cfg.Addr(), err)
		return fmt.Errorf("listen %s: %w", s.cfg.Addr(), err)
	}
	s.logger.Printf("grpc server listening addr=%s", listener.Addr().String())

	errCh := make(chan error, 1)
	go func() {
		errCh <- s.server.Serve(listener)
	}()

	select {
	case <-ctx.Done():
		s.logger.Printf("grpc server shutdown requested addr=%s", s.cfg.Addr())
		s.server.GracefulStop()
		s.logger.Printf("grpc server stopped addr=%s", s.cfg.Addr())
		return nil
	case err := <-errCh:
		if err != nil {
			s.logger.Printf("grpc server exited with error addr=%s err=%v", s.cfg.Addr(), err)
		}
		return err
	}
}
