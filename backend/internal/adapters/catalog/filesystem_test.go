package catalog

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestFilesystemCatalogListsAndFindsTools(t *testing.T) {
	root := t.TempDir()
	writeTool(t, root, "json2yaml", "JSON to YAML", "application/json", "module.wasm")
	writeTool(t, root, "yaml2json", "YAML to JSON", "application/yaml", "module.wasm")

	catalog := NewFilesystemCatalog(root)
	tools, err := catalog.ListTools(context.Background())
	if err != nil {
		t.Fatalf("ListTools returned error: %v", err)
	}
	if got, want := len(tools), 2; got != want {
		t.Fatalf("tools length = %d, want %d", got, want)
	}
	if tools[0].ToolID != "json2yaml" || tools[1].ToolID != "yaml2json" {
		t.Fatalf("tools are not sorted: %#v", tools)
	}

	tool, err := catalog.FindTool(context.Background(), "json2yaml")
	if err != nil {
		t.Fatalf("FindTool returned error: %v", err)
	}
	if got, want := tool.ArtifactPath, filepath.Join("json2yaml", "module.wasm"); got != want {
		t.Fatalf("ArtifactPath = %q, want %q", got, want)
	}
}

func TestFilesystemCatalogReturnsNotFoundForMissingTool(t *testing.T) {
	catalog := NewFilesystemCatalog(t.TempDir())

	if _, err := catalog.FindTool(context.Background(), "missing"); err == nil {
		t.Fatal("expected error")
	}
}

func writeTool(t *testing.T, root, toolID, toolName, mimeType, artifactFile string) {
	t.Helper()

	toolDir := filepath.Join(root, toolID)
	if err := os.MkdirAll(toolDir, 0o755); err != nil {
		t.Fatalf("mkdir failed: %v", err)
	}

	wasmBytes := []byte{
		0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
		0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
		0x03, 0x02, 0x01, 0x00,
		0x07, 0x0b, 0x01, 0x07, 0x63, 0x6f, 0x6e, 0x76, 0x65, 0x72, 0x74, 0x00, 0x00,
		0x0a, 0x04, 0x01, 0x02, 0x00, 0x0b,
	}
	if err := os.WriteFile(filepath.Join(toolDir, artifactFile), wasmBytes, 0o644); err != nil {
		t.Fatalf("write wasm failed: %v", err)
	}

	manifest := map[string]any{
		"api_version":          "v1",
		"tool_id":              toolID,
		"tool_name":            toolName,
		"description":          "Convert text.",
		"module_version":       "1.0.0",
		"entrypoint":           "convert",
		"input_kind":           "text",
		"output_kind":          "text",
		"supported_mime_types": []string{mimeType},
		"cache_ttl_seconds":    86400,
		"artifact_path":        artifactFile,
	}

	bytes, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}
	if err := os.WriteFile(filepath.Join(toolDir, "manifest.json"), append(bytes, '\n'), 0o644); err != nil {
		t.Fatalf("write manifest failed: %v", err)
	}
}
