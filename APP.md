# WASM Tool Store

## Idea

The proposal is to build a WebAssembly app store for small, useful, and fast tools, focused on conversion, validation, formatting, and file manipulation.

The interface works as an application catalog. The user chooses a tool, submits a file or text, and the system performs the processing with WASM modules.

The goal is to showcase a distributed gRPC architecture while keeping the core processing inside specialized modules.

## System Goals

- centralize multiple lightweight tools in a single hub
- allow module reuse by file type
- demonstrate backend-to-backend communication with gRPC
- keep the experience simple for the end user
- use WASM as the foundation for isolated and portable processing

## Architecture Proposal

### Overview

The system can be divided into 4 parts:

1. Frontend
2. Main API
3. Specialized services
4. WASM modules

### Flow

1. The user chooses an app in the WASM Tool Store.
2. The frontend sends the request to the main API.
3. The API validates the request and forwards it to the responsible service via gRPC.
4. The service reads the WASM module stored in the shared volume.
5. The backend returns the module bytes, checksum, and size to Next.
6. Next exposes those bytes to the browser, which downloads and executes the WASM.
7. The result returns to the interface.

## Role Of Each Layer

### Frontend

- displays the app list
- receives file uploads or text input
- shows previews and final results
- displays processing status

### Main API

- authenticates and organizes requests
- decides which service to run
- orchestrates communication between services
- records execution metadata

### Specialized Services

- each service solves one type of task
- examples:
  - file conversion
  - validation
  - formatting
  - compression
  - parsing
- services communicate through gRPC

### WASM Modules

- perform the main processing
- stay isolated from the rest of the system
- can be reused by different apps
- help preserve portability and predictability
- are transferred from the backend to Next and then to the browser in the demo

## Tool Store Apps

The initial catalog ideas include:

- image and document converters
- video and audio compression
- data format and validation tools
- code and text utilities
- playgrounds for languages compiled to WASM

## Why This Fits gRPC

The project requires a backend-to-backend focus, and this architecture fits because:

- the API does not perform all processing on its own
- services exchange data and tasks with each other
- gRPC is used as a fast, typed backend channel
- the system can grow by modules without becoming a monolith

## Technical Challenges

### 1. WASM module size and cost

Some modules can become heavy, especially for media processing and advanced conversion.

### 2. File transfer

The system must handle upload, download, and processed file responses well.

### 3. Cross-language integration

If services are written in different languages, the integration must stay consistent.

### 4. Browser limits

Not every tool will run well directly on the client. Some will depend on the backend.

### 5. Result standardization

Each app must return responses in a predictable format for the frontend.

## Risks And Safeguards

- avoid overly large scope
- prioritize a small set of demonstrable tools
- keep the demo simple and stable
- avoid features that are hard to show live
- choose tools with clear and visible output

## Suggested Demo

A solid presentation demo can follow this script:

1. open the WASM Tool Store
2. choose an app
3. show the call chain between frontend, API, and service
4. show the final result
5. repeat with another format or another tool

## Project Direction

The main idea is not to build only an isolated converter.

The proposal is to show a modular WASM tool platform where each app solves a small task and the gRPC backend coordinates the flow between services.
