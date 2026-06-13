package artifacts

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type FileSystemReader struct {
	root string
}

func NewFileSystemReader(root string) *FileSystemReader {
	return &FileSystemReader{root: root}
}

func (r *FileSystemReader) Read(ctx context.Context, artifactPath string) ([]byte, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	absolutePath, err := r.resolvePath(artifactPath)
	if err != nil {
		return nil, err
	}

	return os.ReadFile(absolutePath)
}

func (r *FileSystemReader) resolvePath(artifactPath string) (string, error) {
	if strings.TrimSpace(r.root) == "" {
		return "", errors.New("artifact root is required")
	}

	if strings.TrimSpace(artifactPath) == "" {
		return "", errors.New("artifact path is required")
	}

	cleanRoot := filepath.Clean(r.root)
	cleanPath := filepath.Clean(filepath.Join(cleanRoot, artifactPath))
	prefix := cleanRoot + string(filepath.Separator)
	if cleanPath != cleanRoot && !strings.HasPrefix(cleanPath, prefix) {
		return "", fmt.Errorf("artifact path escapes root: %q", artifactPath)
	}

	return cleanPath, nil
}
