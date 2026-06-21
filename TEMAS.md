# Idea Catalog For The WASM Tool Store

This file summarizes the tool catalog and the selected direction for the MVP.

## Selected MVP

- `json2yaml`
- `yaml2json`

## Transport Flow

- `Go` talks to `Next` through gRPC.
- `Next` talks to the browser through REST.
- `WebSocket` can be added later for real-time status.
- The browser downloads the WASM and executes the tool locally.

## File Conversion

- PDF -> PNG
- PDF -> JPG
- PDF -> smaller PDF
- MP4 -> WEBM
- WEBM -> MP4
- video compression
- WAV -> MP3
- MP3 -> OGG
- audio compression
- SVG -> optimized SVG
- SVG -> PNG

## Text And Code Tools

- JSON formatter
- JSON Schema validator
- SQL formatter
- JS/CSS/HTML minifier
- code analyzer
- code line counter
- AST viewer
- YAML validator
- YAML ↔ JSON converter
- TypeScript type generator from JSON
- Markdown parser
- small compiler/transpiler
- regex validator

## Broader Applications

- playground for languages compiled to WASM

## Considered gRPC Types

- Unary: 1 request, 1 response
- Server streaming: 1 request, multiple responses
- Client streaming: multiple messages, 1 response at the end
- Bidirectional streaming: client and server exchanging messages in real time
