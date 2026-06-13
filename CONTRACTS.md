# CONTRACTS.md

## Purpose

- Define the contract between browser and `Next`.
- Define the contract between `Next` and `Go`.
- Define the contract for browser-downloaded WASM modules.
- Keep the contracts aligned with `APP.md` and `TEMAS.md`.

## System Intent

- The browser is the user-facing runtime.
- `Next` is the browser-facing BFF.
- `Go` is the gRPC backend used by `Next`.
- The browser never calls gRPC directly.
- The browser executes the WASM tool locally after download and validation.

## Contract Principles

- Every request and response must be typed.
- Every contract must be explicit and versioned.
- Every payload shape must be documented.
- Every error must be understandable without source-code access.
- Every field name must encode intent.
- Every boundary must be narrow.

## Shared Terms

- `tool` means a catalog entry such as JSON to YAML.
- `manifest` means the metadata document for a tool artifact.
- `artifact` means the WASM binary file.
- `job` means one browser-side processing request.
- `result` means the successful output of a job.
- `failure` means a typed error outcome.

## Versioning Rules

- All contracts must include an API version.
- The version must stay stable for the MVP.
- Breaking changes require a version bump.
- Non-breaking additions must preserve existing fields.
- Unknown fields should be ignored when safe.

## Boundary Map

- Browser talks to `Next` through REST.
- Browser may use WebSocket only for optional progress updates.
- `Next` talks to `Go` through gRPC.
- `Go` returns tool metadata, manifest data, and artifact location data.
- Browser downloads the WASM artifact from the URL returned by the flow.
- Browser reuses a cached module only when the manifest version still matches.

## Transport Overview

- Browser -> `Next`: `GET` for tool list, `POST` for prepare/configure, optional WebSocket for status.
- `Next` -> `Go`: unary gRPC calls.
- Browser -> artifact URL: HTTP download of the WASM module.

## Browser And Next Contract

### List Tools

- `GET /api/tools`
- Returns the current catalog of tools.
- The response must include the selected MVP tools `json2yaml` and `yaml2json`.

### Prepare Tool

- `POST /api/tools/{tool_id}/prepare`
- Requests the manifest and download metadata for one tool.
- Returns a browser-ready payload with tool status, manifest URL, and download URL.

### Prepare Request Fields

- `api_version`: contract version string.
- `tool_id`: stable tool identifier.
- `client_request_id`: browser-generated request ID.
- `prefer_client_wasm`: boolean flag indicating browser execution.

### Prepare Response Fields

- `api_version`: echoed contract version.
- `tool_id`: echoed tool identifier.
- `display_name`: user-facing label.
- `entrypoint`: browser runtime entrypoint for the module.
- `status`: `ready`, `loading`, `rejected`, or `failed`.
- `status_message`: short status text.
- `manifest_url`: URL for the manifest document.
- `download_url`: URL for the WASM artifact.
- `module_version`: version string for cache checks.
- `module_sha256`: checksum for integrity validation.
- `module_size_bytes`: expected artifact size.
- `supported_mime_types`: supported input types.
- `wasm_bytes_base64`: encoded module bytes when Next returns the package inline for the MVP.
- `error`: typed error object when applicable.

## Browser State Contract

- `toolId`
- `toolLabel`
- `isConfigured`
- `isLoading`
- `statusMessage`
- `inputValue`
- `outputValue`
- `errorMessage`
- `requestId`
- `moduleVersion`
- `downloadUrl`

## Browser UI Rules

- The page must render a single selected tool at a time.
- The page must show a `tool configurada` state after the WASM module loads.
- The page must not parse protobuf messages manually.
- The page must use a typed adapter.
- The page must render the returned view model only.
- The page must keep the input and output synchronized.

## Go gRPC Contract

## Service Name

- The service name must be `ToolCatalogService`.
- The service must focus on tool discovery and manifest resolution.
- The service must not expose internal package names.

## Primary Methods

- `ListTools`
- `GetToolManifest`

## ListTools Request Fields

- `api_version`: contract version string.
- `client_request_id`: caller-generated request ID.

## ListTools Response Fields

- `api_version`: echoed contract version.
- `tools`: repeated tool summary entries.
- `error`: typed error object when applicable.

## GetToolManifest Request Fields

- `api_version`: contract version string.
- `tool_id`: stable tool identifier.
- `client_request_id`: caller-generated request ID.

## GetToolManifest Response Fields

- `api_version`: echoed contract version.
- `tool_id`: echoed tool identifier.
- `tool_name`: display name.
- `module_version`: version string.
- `module_url`: downloadable WASM URL.
- `module_sha256`: checksum.
- `module_size_bytes`: expected size.
- `entrypoint`: exported function or adapter entry.
- `input_kind`: text, file, or structured.
- `output_kind`: text, file, or structured.
- `supported_mime_types`: repeated supported MIME types.
- `cache_ttl_seconds`: browser cache TTL.
- `error`: typed error object when applicable.

## Request Rules

- `api_version` is required.
- `tool_id` is required for manifest lookup.
- `client_request_id` is required for traceability.
- Unknown tools must be rejected.
- Unknown versions must be rejected.

## Response Rules

- `api_version` must match the supported version.
- `tool_id` must be non-empty on success.
- `module_url` must point to a downloadable WASM artifact.
- `module_sha256` must be present for integrity validation.
- `error` must appear on rejected or failed calls.

## Tool Catalog Contract

- Every tool must have a stable `tool_id`.
- Every tool must have a display name.
- Every tool must have a short description.
- Every tool must have an input kind.
- Every tool must have an output kind.
- Every tool must have a supported execution mode.
- Every tool must have at least one version.

## Tool Execution Modes

- `client_wasm`

## Tool Summary Fields

- `tool_id`
- `display_name`
- `description`
- `input_kind`
- `output_kind`
- `execution_mode`
- `latest_version`
- `manifest_url`
- `download_url`
- `supported_mime_types`

## Manifest Contract

### Manifest Purpose

- The manifest describes a downloadable WASM module.
- The manifest is the first file the browser validates.
- The manifest decides whether the cached module can be reused.
- The manifest is provided through the `Go` to `Next` contract and exposed to the browser by `Next`.

### Manifest Fields

- `api_version`
- `tool_id`
- `tool_name`
- `module_version`
- `module_url`
- `module_sha256`
- `module_size_bytes`
- `entrypoint`
- `input_kind`
- `output_kind`
- `supported_mime_types`
- `cache_ttl_seconds`

### Manifest Rules

- `module_url` must point to a downloadable WASM file.
- `module_sha256` must be used to verify integrity.
- `module_size_bytes` must match the downloaded artifact.
- `entrypoint` must name the exported function or adapter entry.
- `cache_ttl_seconds` controls browser cache reuse.

## Browser Download Contract

- The browser must fetch the manifest first.
- The browser must download the module only after manifest validation.
- The browser must validate checksum before execution.
- The browser must reject modules with mismatched version.
- The browser must reject modules with mismatched tool ID.
- The browser must cache a verified module.

## WASM Runtime Contract

### Browser Execution Model

- The browser owns instantiation.
- The browser owns the JS bridge.
- The browser owns the input and output state.
- The browser must not execute stale modules.

### Input Shape

- `text_input`: string input used by the converter.
- `source_mime_type`: declared input type.
- `tool_id`: selected tool identifier.
- `module_version`: validated module version.

### Output Shape

- `text_output`: converted result.
- `output_mime_type`: result content type.
- `tool_id`: selected tool identifier.
- `module_version`: validated module version.

### WASM Errors

- The browser must report module load failures.
- The browser must report invalid input failures.
- The browser must report execution failures.
- The browser must report checksum failures.
- The browser must not mask the source of the failure.

## Contract Between Go And Browser-Wrapped Flow

- `Go` provides the catalog and manifest metadata.
- `Next` exposes the data to the browser.
- The browser downloads the module using the provided URL.
- The browser validates the checksum before execution.
- The browser may cache the verified module until the manifest version changes.

## Demo Contract

- The demo must show one gRPC call from `Next` to `Go`.
- The demo must show one WASM module download or cache reuse in the browser.
- The demo must show `json2yaml` and `yaml2json` as the first available tools.
- The demo must show the `tool configurada` state before text conversion.
