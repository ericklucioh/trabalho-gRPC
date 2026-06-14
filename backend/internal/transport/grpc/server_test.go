package grpctransport

import (
	"context"
	"encoding/json"
	"net"
	"os"
	"path/filepath"
	"testing"

	"github.com/erick/projs/trabalho-grpc/gen/lojinhawasm/v1"
	"github.com/erick/projs/trabalho-grpc/internal/adapters/artifacts"
	"github.com/erick/projs/trabalho-grpc/internal/adapters/catalog"
	"github.com/erick/projs/trabalho-grpc/internal/application"
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

	root := t.TempDir()
	writeToolFixture(t, root, "json2yaml", "JSON to YAML", "Convert JSON text into YAML text.", "json2yaml/module.wasm", sampleWASMBytes())
	writeToolFixture(t, root, "yaml2json", "YAML to JSON", "Convert YAML text into JSON text.", "yaml2json/module.wasm", sampleWASMBytes())

	lis := bufconn.Listen(1 << 20)
	service := application.NewService(catalog.NewFilesystemCatalog(root), artifacts.NewFileSystemReader(root))
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

func writeToolFixture(t *testing.T, root, toolID, toolName, description, artifactPath string, wasmBytes []byte) {
	t.Helper()

	toolDir := filepath.Join(root, toolID)
	if err := os.MkdirAll(toolDir, 0o755); err != nil {
		t.Fatalf("mkdir failed: %v", err)
	}

	artifactFile := filepath.Join(toolDir, artifactPath)
	if err := os.MkdirAll(filepath.Dir(artifactFile), 0o755); err != nil {
		t.Fatalf("mkdir artifact dir failed: %v", err)
	}

	if err := os.WriteFile(artifactFile, wasmBytes, 0o644); err != nil {
		t.Fatalf("write wasm failed: %v", err)
	}

	manifest := map[string]any{
		"api_version":    "v1",
		"tool_id":        toolID,
		"tool_name":      toolName,
		"description":    description,
		"module_version": "1.0.0",
		"entrypoint":     "convert",
		"input_kind":     "text",
		"output_kind":    "text",
		"supported_mime_types": []string{
			"application/json",
		},
		"cache_ttl_seconds": 86400,
		"artifact_path":     artifactPath,
	}
	if toolID == "yaml2json" {
		manifest["supported_mime_types"] = []string{"application/yaml"}
	}
	if err := writeJSON(filepath.Join(toolDir, "manifest.json"), manifest); err != nil {
		t.Fatalf("write manifest failed: %v", err)
	}
}

func writeJSON(path string, value any) error {
	bytes, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, append(bytes, '\n'), 0o644)
}

func sampleWASMBytes() []byte {
	return []byte{
		0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
		0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
		0x03, 0x02, 0x01, 0x00,
		0x07, 0x0b, 0x01, 0x07, 0x63, 0x6f, 0x6e, 0x76, 0x65, 0x72, 0x74, 0x00, 0x00,
		0x0a, 0x04, 0x01, 0x02, 0x00, 0x0b,
	}
}
