package artifacts

import (
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestReadLoadsArtifactBytes(t *testing.T) {
	root := t.TempDir()
	artifactPath := filepath.Join(root, "json2yaml", "module.wasm")
	if err := os.MkdirAll(filepath.Dir(artifactPath), 0o755); err != nil {
		t.Fatalf("mkdir failed: %v", err)
	}

	want := []byte{0x00, 0x61, 0x73, 0x6d}
	if err := os.WriteFile(artifactPath, want, 0o644); err != nil {
		t.Fatalf("write failed: %v", err)
	}

	reader := NewFileSystemReader(root)
	got, err := reader.Read(context.Background(), "json2yaml/module.wasm")
	if err != nil {
		t.Fatalf("Read returned error: %v", err)
	}

	if string(got) != string(want) {
		t.Fatalf("Read bytes mismatch")
	}
}

func TestReadRejectsTraversal(t *testing.T) {
	reader := NewFileSystemReader(t.TempDir())

	if _, err := reader.Read(context.Background(), "../escape.wasm"); err == nil {
		t.Fatal("expected traversal error")
	}
}
