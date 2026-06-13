# Protobuf Contract

## Scope

Contract between `Next` and `Go` for the MVP.

## Service

- `ToolCatalogService`

## Methods

- `ListTools`
- `GetToolPackage`

## Version

- `api_version` must be `v1`.

## Proto

```proto
syntax = "proto3";

package lojinha.wasm.v1;

option go_package = "github.com/erick/projs/trabalho-gRPC/gen/lojinhawasm/v1;lojinhawasmv1";

service ToolCatalogService {
  rpc ListTools(ListToolsRequest) returns (ListToolsResponse);
  rpc GetToolPackage(GetToolPackageRequest) returns (GetToolPackageResponse);
}

message ListToolsRequest {
  string api_version = 1;
  string client_request_id = 2;
}

message ListToolsResponse {
  string api_version = 1;
  repeated ToolSummary tools = 2;
  TypedError error = 3;
}

message GetToolPackageRequest {
  string api_version = 1;
  string tool_id = 2;
  string client_request_id = 3;
}

message GetToolPackageResponse {
  string api_version = 1;
  string tool_id = 2;
  string tool_name = 3;
  string description = 4;
  string module_version = 5;
  string entrypoint = 6;
  string input_kind = 7;
  string output_kind = 8;
  repeated string supported_mime_types = 9;
  uint32 cache_ttl_seconds = 10;
  bytes wasm_bytes = 11;
  string wasm_sha256 = 12;
  uint64 wasm_size_bytes = 13;
  TypedError error = 14;
}

message ToolSummary {
  string tool_id = 1;
  string display_name = 2;
  string description = 3;
  string latest_version = 4;
}

message TypedError {
  string code = 1;
  string message = 2;
  string offending_value = 3;
  string expected_shape = 4;
}
```

## MVP Tools

- `json2yaml`
- `yaml2json`

## Rules

- `ListTools` returns the available tools.
- `GetToolPackage` returns the WASM bytes for the selected tool.
- `wasm_bytes` must contain the file bytes of the module.
- `wasm_sha256` must be used to verify the received bytes.
- `wasm_size_bytes` must match the downloaded payload.
- Unknown `tool_id` values must be rejected.
- The contract stays stable for the MVP.

