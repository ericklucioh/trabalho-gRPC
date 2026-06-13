package catalog

import (
	"context"

	"github.com/erick/projs/trabalho-grpc/internal/application"
	"github.com/erick/projs/trabalho-grpc/internal/domain"
)

type StaticCatalog struct {
	entries []domain.ToolCatalogEntry
	index   map[string]domain.ToolCatalogEntry
}

func NewStaticCatalog() *StaticCatalog {
	entries := []domain.ToolCatalogEntry{
		{
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
		{
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

	index := make(map[string]domain.ToolCatalogEntry, len(entries))
	for _, entry := range entries {
		index[entry.ToolID] = entry
	}

	return &StaticCatalog{entries: entries, index: index}
}

func (c *StaticCatalog) ListTools(ctx context.Context) ([]domain.ToolCatalogEntry, error) {
	entries := make([]domain.ToolCatalogEntry, len(c.entries))
	copy(entries, c.entries)

	return entries, nil
}

func (c *StaticCatalog) FindTool(ctx context.Context, toolID string) (domain.ToolCatalogEntry, error) {
	entry, ok := c.index[toolID]
	if !ok {
		return domain.ToolCatalogEntry{}, application.ErrNotFound
	}

	return entry, nil
}

var _ interface {
	ListTools(context.Context) ([]domain.ToolCatalogEntry, error)
	FindTool(context.Context, string) (domain.ToolCatalogEntry, error)
} = (*StaticCatalog)(nil)
