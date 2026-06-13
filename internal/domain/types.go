package domain

const SupportedAPIVersion = "v1"

type ListToolsRequest struct {
	APIVersion      string
	ClientRequestID string
}

type GetToolPackageRequest struct {
	APIVersion      string
	ToolID          string
	ClientRequestID string
}

type ListToolsResult struct {
	APIVersion string
	Tools      []ToolSummary
}

type ToolSummary struct {
	ToolID        string
	DisplayName   string
	Description   string
	LatestVersion string
}

type ToolCatalogEntry struct {
	ToolID             string
	DisplayName        string
	Description        string
	LatestVersion      string
	Entrypoint         string
	InputKind          string
	OutputKind         string
	SupportedMIMETypes []string
	CacheTTLSeconds    uint32
	ArtifactPath       string
}

type ToolPackage struct {
	APIVersion         string
	ToolID             string
	ToolName           string
	Description        string
	ModuleVersion      string
	Entrypoint         string
	InputKind          string
	OutputKind         string
	SupportedMIMETypes []string
	CacheTTLSeconds    uint32
	WASMBytes          []byte
	WASMSHA256         string
	WASMSizeBytes      uint64
}

func (entry ToolCatalogEntry) Summary() ToolSummary {
	return ToolSummary{
		ToolID:        entry.ToolID,
		DisplayName:   entry.DisplayName,
		Description:   entry.Description,
		LatestVersion: entry.LatestVersion,
	}
}
