package application

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sort"

	"github.com/erick/projs/trabalho-grpc/internal/domain"
)

type CatalogStore interface {
	ListTools(ctx context.Context) ([]domain.ToolCatalogEntry, error)
	FindTool(ctx context.Context, toolID string) (domain.ToolCatalogEntry, error)
}

type ArtifactReader interface {
	Read(ctx context.Context, artifactPath string) ([]byte, error)
}

type Service struct {
	catalogStore CatalogStore
	artifactRead ArtifactReader
}

func NewService(catalogStore CatalogStore, artifactRead ArtifactReader) *Service {
	return &Service{catalogStore: catalogStore, artifactRead: artifactRead}
}

func (s *Service) ListTools(ctx context.Context, request domain.ListToolsRequest) (domain.ListToolsResult, error) {
	if err := ctx.Err(); err != nil {
		return domain.ListToolsResult{}, err
	}

	if request.APIVersion != domain.SupportedAPIVersion {
		return domain.ListToolsResult{}, domain.NewError(
			domain.ErrorCodeUnsupportedVersion,
			"api version is not supported",
			request.APIVersion,
			domain.SupportedAPIVersion,
			nil,
		)
	}

	entries, err := s.catalogStore.ListTools(ctx)
	if err != nil {
		return domain.ListToolsResult{}, domain.NewError(domain.ErrorCodeInternal, "failed to list tools", "", "catalog store list result", err)
	}

	sort.SliceStable(entries, func(i, j int) bool {
		return entries[i].ToolID < entries[j].ToolID
	})

	result := domain.ListToolsResult{
		APIVersion: domain.SupportedAPIVersion,
		Tools:      make([]domain.ToolSummary, 0, len(entries)),
	}
	for _, entry := range entries {
		result.Tools = append(result.Tools, entry.Summary())
	}

	return result, nil
}

func (s *Service) GetToolPackage(ctx context.Context, request domain.GetToolPackageRequest) (domain.ToolPackage, error) {
	if err := ctx.Err(); err != nil {
		return domain.ToolPackage{}, err
	}

	if request.APIVersion != domain.SupportedAPIVersion {
		return domain.ToolPackage{}, domain.NewError(
			domain.ErrorCodeUnsupportedVersion,
			"api version is not supported",
			request.APIVersion,
			domain.SupportedAPIVersion,
			nil,
		)
	}

	entry, err := s.catalogStore.FindTool(ctx, request.ToolID)
	if err != nil {
		return domain.ToolPackage{}, wrapCatalogError(request.ToolID, err)
	}

	bytes, err := s.artifactRead.Read(ctx, entry.ArtifactPath)
	if err != nil {
		return domain.ToolPackage{}, domain.NewError(domain.ErrorCodeArtifactUnavailable, "failed to read wasm artifact", entry.ArtifactPath, "readable artifact bytes", err)
	}

	return buildToolPackage(entry, bytes), nil
}

func buildToolPackage(entry domain.ToolCatalogEntry, wasmBytes []byte) domain.ToolPackage {
	sum := sha256.Sum256(wasmBytes)

	return domain.ToolPackage{
		APIVersion:         domain.SupportedAPIVersion,
		ToolID:             entry.ToolID,
		ToolName:           entry.DisplayName,
		Description:        entry.Description,
		ModuleVersion:      entry.LatestVersion,
		Entrypoint:         entry.Entrypoint,
		InputKind:          entry.InputKind,
		OutputKind:         entry.OutputKind,
		SupportedMIMETypes: append([]string(nil), entry.SupportedMIMETypes...),
		CacheTTLSeconds:    entry.CacheTTLSeconds,
		WASMBytes:          append([]byte(nil), wasmBytes...),
		WASMSHA256:         hex.EncodeToString(sum[:]),
		WASMSizeBytes:      uint64(len(wasmBytes)),
	}
}

func wrapCatalogError(toolID string, err error) error {
	if errors.Is(err, ErrNotFound) {
		return domain.NewError(domain.ErrorCodeToolNotFound, "tool is not supported", toolID, "registered tool id", err)
	}

	return domain.NewError(domain.ErrorCodeInternal, "catalog lookup failed", toolID, "catalog entry", err)
}
