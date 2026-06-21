# WASM Tool Store

Demo project for a WebAssembly tool store, focused on backend-to-backend gRPC communication and WASM module delivery for in-browser execution.

## Idea

The application works as a catalog of small, useful tools. The user chooses a tool, submits text for processing, and receives the converted result in the interface.


## Example

You know when we need to remove the background from an image, convert a file, compress a PDF, and we have to keep searching for websites to do it for us? It is always the same thing.

480p is free, but 4K is paid. Files over 5 MB are paid. You can only make 10 conversions per hour.

Why? Both to make money and because there is a cost involved in uploading the file, processing it, and sending it back. That is why these limitations exist.

My idea comes in exactly at this point. Instead of uploading the file, the user downloads the application and runs the tool directly in their browser.

“But won’t that freeze the user’s computer or make it slow?”

Honestly, people would rather spend 2 to 5 minutes with their PC frozen while converting a single file than pay one dollar to a website they do not know, from a source they do not trust, and that they may never use again.

# My goal

To turn this project, which started as a college assignment, into a real open-source project: something people can run, contribute to, create more tools for, and eventually have hosted somewhere.


## Goals

- centralize lightweight tools in a single hub
- serve WASM modules from the backend
- execute WASM in the browser
- keep the demo simple for presentations
- demonstrate gRPC communication between backends

## Architecture

The system is split into 4 parts:

1. Next.js/Node application
2. Go gRPC service
3. WASM modules
4. Browser

### Demo flow

1. The user opens the interface in the browser.
2. The Next.js application renders the interface and receives the browser request.
3. The Node runtime inside Next calls the Go backend through gRPC.
4. The backend returns the catalog, manifest, and WASM module bytes.
5. Next delivers the package to the browser, which downloads the WASM and runs the tool locally.
6. The result appears on screen.

## Role Of Each Layer

### Next.js/Node Application

- renders the browser interface
- exposes the HTTP routes used by the UI
- coordinates user requests
- acts as the gRPC bridge to the Go backend
- delivers the data required for the browser to load the WASM

### Go Service

- exposes the gRPC service
- maintains the tool catalog
- reads WASM manifests and artifacts
- returns module metadata and bytes

### WASM Modules

- perform the main processing
- run in the browser
- can be reused by other tools

### Browser

- displays the final interface
- downloads the WASM module prepared by Next
- executes the tool locally
- shows the result to the user

## Technologies

- **Go 1.26.1**
- **gRPC**
- **Protocol Buffers**
- **Node.js 22**
- **Next.js 14**
- **React 18**
- **TypeScript**
- **WebAssembly**
- **Docker**
- **Docker Compose**
- **Rust** for building the WASM modules

## Running

The project runs with:

```bash
docker compose up
```

Then open:

- frontend: `http://localhost:3000`
- backend gRPC: `localhost:50051`

## Running Locally

### Backend Go

```bash
cd backend
go run ./cmd/server
```

Useful environment variables:

- `GRPC_PORT` - gRPC server port, default `50051`
- `ARTIFACT_ROOT` - WASM artifacts directory, default `./artifacts`
- `SHUTDOWN_TIMEOUT_SECONDS` - graceful shutdown timeout, default `5`

### Frontend Next.js

```bash
cd frontend
npm ci
GRPC_ENDPOINT=127.0.0.1:50051 npm run dev
```

Then open:

- `http://localhost:3000`

## Artifact Structure

Each tool contains:

- `manifest.json`
- `module.wasm`
- `sha256.txt`

Artifacts are stored in `backend/artifacts/<tool-id>/`.

## WASM Build

If you need to rebuild the modules, the project includes a Rust workspace in `tools/` and scripts in the `Makefile`.

Useful commands:

```bash
make test-rust
make build-wasm-tools
make verify-wasm-tools
make ci-tools-wasm
```

## Suggested Demo

1. Open the WASM Tool Store.
2. Choose `json2yaml` or `yaml2json`.
3. Configure the tool.
4. Submit input text.
5. Show the converted result.
