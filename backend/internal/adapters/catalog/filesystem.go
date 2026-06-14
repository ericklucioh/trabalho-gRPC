package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/erick/projs/trabalho-grpc/internal/application"
	"github.com/erick/projs/trabalho-grpc/internal/domain"
)

type FilesystemCatalog struct {
	root string
}

type manifest struct {
	APIVersion         string   `json:"api_version"`
	ToolID             string   `json:"tool_id"`
	ToolName           string   `json:"tool_name"`
	Description        string   `json:"description"`
	ModuleVersion      string   `json:"module_version"`
	Entrypoint         string   `json:"entrypoint"`
	InputKind          string   `json:"input_kind"`
	OutputKind         string   `json:"output_kind"`
	SupportedMIMETypes []string `json:"supported_mime_types"`
	CacheTTLSeconds    uint32   `json:"cache_ttl_seconds"`
	ArtifactPath       string   `json:"artifact_path"`
}

func NewFilesystemCatalog(root string) *FilesystemCatalog {
	return &FilesystemCatalog{root: root}
}

func (c *FilesystemCatalog) ListTools(ctx context.Context) ([]domain.ToolCatalogEntry, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(c.root) == "" {
		return nil, fmt.Errorf("catalog root is required")
	}

	entries, err := os.ReadDir(c.root)
	if err != nil {
		return nil, fmt.Errorf("read catalog root %q: %w", c.root, err)
	}

	tools := make([]domain.ToolCatalogEntry, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		tool, err := c.readTool(entry.Name())
		if err != nil {
			if errors.Is(err, application.ErrNotFound) {
				continue
			}

			return nil, err
		}

		tools = append(tools, tool)
	}

	sort.SliceStable(tools, func(i, j int) bool {
		return tools[i].ToolID < tools[j].ToolID
	})

	return tools, nil
}

func (c *FilesystemCatalog) FindTool(ctx context.Context, toolID string) (domain.ToolCatalogEntry, error) {
	if err := ctx.Err(); err != nil {
		return domain.ToolCatalogEntry{}, err
	}

	tool, err := c.readTool(toolID)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			return domain.ToolCatalogEntry{}, application.ErrNotFound
		}

		return domain.ToolCatalogEntry{}, err
	}

	return tool, nil
}

func (c *FilesystemCatalog) readTool(toolID string) (domain.ToolCatalogEntry, error) {
	if strings.TrimSpace(c.root) == "" {
		return domain.ToolCatalogEntry{}, fmt.Errorf("catalog root is required")
	}

	manifestPath := filepath.Join(c.root, toolID, "manifest.json")
	bytes, err := os.ReadFile(manifestPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return domain.ToolCatalogEntry{}, application.ErrNotFound
		}

		return domain.ToolCatalogEntry{}, fmt.Errorf("read manifest %q: %w", manifestPath, err)
	}

	toolManifest, err := parseManifest(bytes)
	if err != nil {
		return domain.ToolCatalogEntry{}, fmt.Errorf("parse manifest %q: %w", manifestPath, err)
	}

	if toolManifest.ToolID != toolID {
		return domain.ToolCatalogEntry{}, fmt.Errorf("manifest tool_id mismatch for %q: got %q", toolID, toolManifest.ToolID)
	}

	if toolManifest.APIVersion != domain.SupportedAPIVersion {
		return domain.ToolCatalogEntry{}, fmt.Errorf("manifest api_version mismatch for %q: got %q", toolID, toolManifest.APIVersion)
	}

	artifactPath := toolManifest.ArtifactPath
	if strings.TrimSpace(artifactPath) == "" {
		artifactPath = "module.wasm"
	}
	cleanArtifactPath := filepath.Clean(artifactPath)
	if filepath.IsAbs(cleanArtifactPath) || strings.HasPrefix(cleanArtifactPath, "..") {
		return domain.ToolCatalogEntry{}, fmt.Errorf("invalid artifact_path for %q: %q", toolID, artifactPath)
	}

	return domain.ToolCatalogEntry{
		ToolID:             toolManifest.ToolID,
		DisplayName:        toolManifest.ToolName,
		Description:        toolManifest.Description,
		LatestVersion:      toolManifest.ModuleVersion,
		Entrypoint:         toolManifest.Entrypoint,
		InputKind:          toolManifest.InputKind,
		OutputKind:         toolManifest.OutputKind,
		SupportedMIMETypes: append([]string(nil), toolManifest.SupportedMIMETypes...),
		CacheTTLSeconds:    toolManifest.CacheTTLSeconds,
		ArtifactPath:       filepath.Join(toolID, cleanArtifactPath),
	}, nil
}

func parseManifest(bytes []byte) (manifest, error) {
	var parsed manifest
	if err := json.Unmarshal(bytes, &parsed); err != nil {
		return manifest{}, err
	}

	return parsed, nil
}

var _ interface {
	ListTools(context.Context) ([]domain.ToolCatalogEntry, error)
	FindTool(context.Context, string) (domain.ToolCatalogEntry, error)
} = (*FilesystemCatalog)(nil)
