package application

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"testing"

	"github.com/erick/projs/trabalho-grpc/internal/domain"
)

type fakeCatalogStore struct {
	entries map[string]domain.ToolCatalogEntry
}

func (f fakeCatalogStore) ListTools(ctx context.Context) ([]domain.ToolCatalogEntry, error) {
	entries := make([]domain.ToolCatalogEntry, 0, len(f.entries))
	for _, entry := range f.entries {
		entries = append(entries, entry)
	}

	return entries, nil
}

func (f fakeCatalogStore) FindTool(ctx context.Context, toolID string) (domain.ToolCatalogEntry, error) {
	entry, ok := f.entries[toolID]
	if !ok {
		return domain.ToolCatalogEntry{}, ErrNotFound
	}

	return entry, nil
}

type fakeArtifactReader struct {
	bytes []byte
	err   error
}

func (f fakeArtifactReader) Read(ctx context.Context, artifactPath string) ([]byte, error) {
	if f.err != nil {
		return nil, f.err
	}

	return append([]byte(nil), f.bytes...), nil
}

func TestListToolsReturnsBothTools(t *testing.T) {
	service := NewService(fakeCatalogStore{
		entries: sampleEntries(),
	}, fakeArtifactReader{})

	result, err := service.ListTools(context.Background(), domain.ListToolsRequest{
		APIVersion:      domain.SupportedAPIVersion,
		ClientRequestID: "request-1",
	})
	if err != nil {
		t.Fatalf("ListTools returned error: %v", err)
	}

	if got, want := result.APIVersion, domain.SupportedAPIVersion; got != want {
		t.Fatalf("APIVersion = %q, want %q", got, want)
	}

	if got, want := len(result.Tools), 2; got != want {
		t.Fatalf("tools length = %d, want %d", got, want)
	}

	if result.Tools[0].ToolID != "json2yaml" || result.Tools[1].ToolID != "yaml2json" {
		t.Fatalf("tools are not sorted by tool id: %#v", result.Tools)
	}
}

func TestGetToolPackageReturnsBytesAndChecksum(t *testing.T) {
	wasmBytes := sampleWASMBytes()
	service := NewService(fakeCatalogStore{
		entries: sampleEntries(),
	}, fakeArtifactReader{bytes: wasmBytes})

	result, err := service.GetToolPackage(context.Background(), domain.GetToolPackageRequest{
		APIVersion:      domain.SupportedAPIVersion,
		ToolID:          "json2yaml",
		ClientRequestID: "request-2",
	})
	if err != nil {
		t.Fatalf("GetToolPackage returned error: %v", err)
	}

	sum := sha256.Sum256(wasmBytes)
	if !bytes.Equal(result.WASMBytes, wasmBytes) {
		t.Fatalf("WASMBytes mismatch")
	}
	if got, want := result.WASMSHA256, hex.EncodeToString(sum[:]); got != want {
		t.Fatalf("WASMSHA256 = %q, want %q", got, want)
	}
	if got, want := result.WASMSizeBytes, uint64(len(wasmBytes)); got != want {
		t.Fatalf("WASMSizeBytes = %d, want %d", got, want)
	}
	if got, want := result.ToolID, "json2yaml"; got != want {
		t.Fatalf("ToolID = %q, want %q", got, want)
	}
}

func TestGetToolPackageRejectsUnsupportedTool(t *testing.T) {
	service := NewService(fakeCatalogStore{entries: sampleEntries()}, fakeArtifactReader{})

	_, err := service.GetToolPackage(context.Background(), domain.GetToolPackageRequest{
		APIVersion:      domain.SupportedAPIVersion,
		ToolID:          "not-a-tool",
		ClientRequestID: "request-3",
	})
	if err == nil {
		t.Fatal("expected error")
	}

	var appErr domain.AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("error = %T, want domain.AppError", err)
	}
	if appErr.Code != domain.ErrorCodeToolNotFound {
		t.Fatalf("error code = %q, want %q", appErr.Code, domain.ErrorCodeToolNotFound)
	}
}

func sampleEntries() map[string]domain.ToolCatalogEntry {
	return map[string]domain.ToolCatalogEntry{
		"json2yaml": {
			ToolID:             "json2yaml",
			DisplayName:        "JSON to YAML",
			Description:        "Convert JSON text into YAML text.",
			LatestVersion:      "1.0.0",
			Entrypoint:         "convert",
			InputKind:          "text",
			OutputKind:         "text",
			SupportedMIMETypes: []string{"application/json"},
			CacheTTLSeconds:    300,
			ArtifactPath:       "json2yaml/module.wasm",
		},
		"yaml2json": {
			ToolID:             "yaml2json",
			DisplayName:        "YAML to JSON",
			Description:        "Convert YAML text into JSON text.",
			LatestVersion:      "1.0.0",
			Entrypoint:         "convert",
			InputKind:          "text",
			OutputKind:         "text",
			SupportedMIMETypes: []string{"application/yaml"},
			CacheTTLSeconds:    300,
			ArtifactPath:       "yaml2json/module.wasm",
		},
	}
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
