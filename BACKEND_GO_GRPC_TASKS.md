# Backend Go gRPC Tasks

## Purpose

- Build the Go backend that `Next` calls over gRPC.
- Expose tool catalog and manifest data for the browser flow.
- Keep the backend as the source of truth for tools and artifacts.

## Scope

- One Go backend service for now.
- One gRPC boundary consumed by `Next`.
- One catalog flow.
- One manifest resolution flow.
- No WASM execution in Go for the MVP.
- No authentication yet.
- No persistence layer yet.

## Product Goal

- Receive requests from `Next`.
- Resolve the requested tool metadata.
- Return catalog and manifest data.
- Keep transport concerns separate from domain rules.

## Service Responsibilities

- Define protobuf contracts.
- Implement gRPC server endpoints.
- Translate transport messages to domain queries.
- Validate request shape.
- Resolve tool and artifact metadata.
- Return explicit results or structured errors.
- Keep business rules out of handlers.

## Architecture Tasks

- Split transport, domain, and adapter code.
- Keep the gRPC layer thin.
- Keep catalog resolution in a service package.
- Keep artifact reads in a dedicated adapter package.
- Keep shared DTOs explicit and typed.
- Avoid cross-layer imports that violate boundaries.

## gRPC Contract Tasks

- Define the proto package name.
- Define the service name.
- Define the unary methods for listing tools and resolving manifests.
- Define the request messages.
- Define the response messages.
- Define error-related fields if needed.
- Keep the proto file minimal.

## Request Model Tasks

- Accept the API version.
- Accept the selected tool ID.
- Accept the client request ID.
- Accept the requested version if needed.
- Reject missing required fields.
- Reject unsupported tools.
- Reject malformed version strings.

## Response Model Tasks

- Return the tool catalog when requested.
- Return the manifest and artifact metadata when requested.
- Return the download URL for the browser.
- Return error code and message on failure.
- Keep the response shape stable.

## Validation Tasks

- Validate tool IDs against an allowlist.
- Validate requested versions before processing.
- Validate that the API version is supported.
- Validate unknown combinations early.
- Keep validation errors readable.

## Transport Tasks

- Implement the gRPC server entrypoint.
- Register the service implementation.
- Load config from environment.
- Listen on a configurable port.
- Support local development defaults.
- Support graceful shutdown.
- Keep server startup logic separate from handler logic.

## Handler Tasks

- Keep handlers small.
- Parse the request into a domain query.
- Call the application service.
- Map domain failures to gRPC errors.
- Map domain success to gRPC responses.
- Avoid putting orchestration in the handler.

## Domain Tasks

- Define a tool query type.
- Define a tool summary type.
- Define a manifest type.
- Define version rules.
- Define catalog lookup rules.
- Define error categories.
- Keep the domain independent of gRPC.

## Service Layer Tasks

- Orchestrate the full request lifecycle.
- Resolve the selected tool.
- Load the manifest metadata.
- Collect artifact metadata.
- Normalize the output before returning it.
- Convert adapter failures into domain failures.
- Keep one responsibility per method.

## Adapter Tasks

- Build a manifest reader adapter.
- Encapsulate file-system access.
- Encapsulate metadata parsing.
- Encapsulate checksum lookup.
- Hide runtime-specific implementation details.
- Keep adapter methods replaceable in tests.

## Error Handling Tasks

- Return clear gRPC status codes.
- Distinguish invalid input from missing tool.
- Distinguish missing artifact from internal failure.
- Include offending values in messages when useful.
- Wrap lower-level errors with context.
- Do not leak raw infrastructure errors to clients.

## Configuration Tasks

- Read the gRPC port from env.
- Read the artifact root path from env.
- Read the manifest root path from env.
- Read timeout values from env.
- Provide sane local defaults.
- Keep config parsing explicit.

## Logging Tasks

- Log request start.
- Log request end.
- Log request duration.
- Log tool ID.
- Log validation failures.
- Log adapter failures.
- Avoid logging secrets or full payloads.

## Testing Tasks

- Test request validation.
- Test success mapping.
- Test failure mapping.
- Test unsupported tool behavior.
- Test manifest reader error propagation.
- Test handler isolation.
- Test service orchestration.

## Dependency Tasks

- Keep protobuf generation isolated.
- Keep gRPC runtime dependencies explicit.
- Keep file-system access behind adapters.
- Avoid importing frontend concepts into backend packages.
- Avoid indirect dependency cycles.

## Package Split

- `cmd/server`
- `internal/config`
- `internal/transport/grpc`
- `internal/application`
- `internal/domain`
- `internal/adapters/artifacts`
- `internal/adapters/logging`

## Suggested File Split

- `cmd/server/main.go`
- `internal/config/config.go`
- `internal/transport/grpc/server.go`
- `internal/transport/grpc/handler.go`
- `internal/application/resolve_tool.go`
- `internal/domain/tool_query.go`
- `internal/domain/tool_manifest.go`
- `internal/adapters/artifacts/reader.go`

## Main Flow Tasks

- Receive the gRPC request from `Next`.
- Validate the request.
- Convert it to a domain query.
- Resolve the tool.
- Read the manifest and artifact metadata.
- Return the catalog or manifest response.

## File Handling Tasks

- Keep reads explicit and bounded.
- Avoid temp files unless necessary.
- Keep transfer formats explicit.
- Prefer simple metadata reads first.
- Do not load the full WASM artifact if the manifest is enough.

## Time And Cancellation Tasks

- Accept request context.
- Respect deadlines.
- Return timeout errors clearly.
- Keep context handling consistent.

## Size And Safety Tasks

- Enforce a max payload size for metadata requests.
- Refuse oversized requests early.
- Avoid loading unnecessary files.
- Avoid keeping large buffers longer than needed.
- Avoid unnecessary copies of bytes.

## Observability Tasks

- Add request IDs if useful.
- Add structured logs if available.
- Add minimal timing metrics if easy.
- Keep debug output readable.
- Make failures traceable in the demo.

## Demo Tasks

- Start the Go gRPC server locally.
- Let `Next` request the tool catalog.
- Let `Next` request a manifest for `json2yaml`.
- Return the download metadata needed by the browser.
- Show the browser downloading and executing the WASM tool.

## Implementation Order

- Define the proto contract.
- Generate Go bindings.
- Implement config loading.
- Implement domain query and manifest types.
- Implement the manifest reader boundary.
- Implement the application service.
- Implement the gRPC handler.
- Wire the server entrypoint.
- Add tests.

## Definition Of Done

- The server starts cleanly.
- `Next` can query the service over gRPC.
- The service returns tool metadata and manifest data.
- The browser receives usable artifact URLs through `Next`.
- Errors are mapped clearly.
- The code stays separated by responsibility.

## Task List

- Define proto messages.
- Define proto service methods.
- Generate Go code.
- Create request validators.
- Create response mappers.
- Create domain query types.
- Create domain manifest types.
- Create the service orchestrator.
- Create the gRPC handler.
- Create the config loader.
- Create the server bootstrap.

