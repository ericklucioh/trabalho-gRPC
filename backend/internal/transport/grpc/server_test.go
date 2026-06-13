package grpctransport

import (
	"context"
	"net"
	"path/filepath"
	"testing"

	"github.com/erick/projs/trabalho-grpc/gen/lojinhawasm/v1"
	"github.com/erick/projs/trabalho-grpc/internal/adapters/artifacts"
	"github.com/erick/projs/trabalho-grpc/internal/adapters/catalog"
	"github.com/erick/projs/trabalho-grpc/internal/application"
	"github.com/erick/projs/trabalho-grpc/internal/config"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"
)

func TestGRPCContractListsToolsAndReturnsPackage(t *testing.T) {
	conn, cleanup := startBufferedServer(t)
	defer cleanup()

	client := lojinhawasmv1.NewToolCatalogServiceClient(conn)

	listResponse, err := client.ListTools(context.Background(), &lojinhawasmv1.ListToolsRequest{
		ApiVersion:      "v1",
		ClientRequestId: "request-1",
	})
	if err != nil {
		t.Fatalf("ListTools failed: %v", err)
	}
	if got, want := len(listResponse.GetTools()), 2; got != want {
		t.Fatalf("ListTools count = %d, want %d", got, want)
	}

	packageResponse, err := client.GetToolPackage(context.Background(), &lojinhawasmv1.GetToolPackageRequest{
		ApiVersion:      "v1",
		ToolId:          "json2yaml",
		ClientRequestId: "request-2",
	})
	if err != nil {
		t.Fatalf("GetToolPackage failed: %v", err)
	}
	if got, want := packageResponse.GetToolId(), "json2yaml"; got != want {
		t.Fatalf("ToolId = %q, want %q", got, want)
	}
	if len(packageResponse.GetWasmBytes()) == 0 {
		t.Fatal("expected wasm bytes")
	}
}

func startBufferedServer(t *testing.T) (*grpc.ClientConn, func()) {
	t.Helper()

	lis := bufconn.Listen(1 << 20)
	cfg := config.Config{GRPCPort: "0", ArtifactRoot: filepath.Join("..", "..", "..", "artifacts"), APIVersion: "v1"}
	service := application.NewService(catalog.NewStaticCatalog(), artifacts.NewFileSystemReader(cfg.ArtifactRoot))
	server := grpc.NewServer()
	lojinhawasmv1.RegisterToolCatalogServiceServer(server, NewHandler(service))

	go func() {
		_ = server.Serve(lis)
	}()

	dialer := func(context.Context, string) (net.Conn, error) {
		return lis.Dial()
	}
	conn, err := grpc.DialContext(context.Background(), "bufnet", grpc.WithContextDialer(dialer), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("DialContext failed: %v", err)
	}

	return conn, func() {
		_ = conn.Close()
		server.Stop()
	}
}
