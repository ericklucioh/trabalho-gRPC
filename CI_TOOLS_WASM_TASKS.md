# CI Tools WASM Tasks

## Purpose

- Build the WASM tools in CI.
- Publish the compiled artifacts into one shared output root.
- Make the output readable by the Go backend and the Next.js layer.
- Keep the build deterministic, explainable, and easy to reproduce locally.

## Current Repo State

- The Rust workspace lives in `tools/`.
- `json2yaml` exists today.
- `yaml2json` is part of the MVP target and must be added before the full demo is complete.
- CI should fail if the declared MVP tools and the workspace contents diverge.

## Implemented Flow

- Local build and verify commands live in `Makefile`.
- Tool definitions and packaging rules live in `scripts/wasm-tools/definitions.mjs`.
- The build step packages outputs into `dist/tools/<tool_id>/`.
- The GitHub Actions workflow lives in `.github/workflows/ci-tools-wasm.yml`.
- The workflow builds, verifies, and uploads the produced tool bundle.

## Scope

- One CI workflow for tool builds.
- One shared output directory contract.
- One artifact bundle per tool.
- One manifest file per tool.
- No deployment pipeline yet.
- No remote registry yet.
- No runtime compilation inside the backend.

## Build Goal

- Turn each source tool into a browser-compatible WASM artifact.
- Store the artifact in a predictable folder.
- Store the manifest and checksum beside the artifact.
- Let the Go backend read the manifest and resolve the artifact.
- Let `Next` expose the tool metadata to the browser.

## Selected MVP Tools

- `json2yaml`
- `yaml2json`

## Output Contract

- Shared output root: `dist/tools`.
- Tool folder: `dist/tools/<tool_id>/`.
- WASM artifact: `dist/tools/<tool_id>/module.wasm`.
- Manifest: `dist/tools/<tool_id>/manifest.json`.
- Metadata: `dist/tools/<tool_id>/metadata.json`.
- Checksum: `dist/tools/<tool_id>/sha256.txt`.

## Folder Rules

- Each tool gets its own directory.
- The folder name must match the stable `tool_id`.
- The backend may read artifacts and manifests from the folder.
- The backend must not write to the folder.
- CI may clean the folder before a build.
- The folder layout must remain stable across builds.

## Artifact Rules

- Build each tool as a separate artifact.
- Keep artifact names predictable.
- Store the compiled WASM bytes in `module.wasm`.
- Store a SHA-256 checksum for integrity validation.
- Store the tool version for traceability.
- Store a human-readable label for the demo.
- Keep the artifact contract explicit.

## Manifest Rules

- Create one manifest per tool.
- Include `api_version`.
- Include `tool_id`.
- Include `tool_name`.
- Include `module_version`.
- Include `module_url`.
- Include `module_sha256`.
- Include `module_size_bytes`.
- Include `supported_mime_types`.
- Keep the schema explicit and versioned.

## Backend Access Rules

- Go reads the manifest first.
- Go resolves the module path second.
- Go verifies the checksum third.
- Go reads the module bytes only after validation.
- Go maps `tool_id` to a stable folder name.
- Go fails clearly when files are missing or inconsistent.

## CI Pipeline Tasks

- Add a build job for tool artifacts.
- Add a validation job for manifests and checksums.
- Add a packaging job for the output folder.
- Add a publish step for the shared artifact root.
- Add a cleanup step for stale outputs.
- Add a verification step for the final bundle.
- Add a backend smoke check if the backend code is available.

## Reproducibility Tasks

- Pin the Rust toolchain version.
- Pin dependency versions through `Cargo.lock`.
- Avoid mutable `latest` tags.
- Avoid time-dependent build output.
- Avoid random build order.
- Keep build inputs explicit.
- Keep build outputs stable.

## Tooling Tasks

- Use the appropriate Rust WASM target for browser-compatible output.
- Keep build commands documented in one place.
- Keep tool-specific build flags centralized.
- Avoid duplicated build scripts.
- Keep shared build logic reusable.
- Keep CI steps short and focused.

## Validation Tasks

- Validate that each required tool was built.
- Validate the output folder exists.
- Validate artifact names.
- Validate file sizes.
- Validate checksums.
- Validate manifest schema.
- Fail fast on missing outputs.

## Local Development Tasks

- Mirror the CI output folder locally.
- Provide a local build command.
- Provide a local clean command.
- Provide a local verify command.
- Keep local paths compatible with CI paths when possible.
- Make local reproduction of CI output easy.

## Logging Tasks

- Log build start.
- Log build finish.
- Log artifact names.
- Log output paths.
- Log checksum creation.
- Log validation failures.
- Avoid logging secrets or full environment values.

## Error Handling Tasks

- Fail when the tool build fails.
- Fail when the artifact folder is missing.
- Fail when the manifest is invalid.
- Fail when the checksum does not match.
- Fail when the backend cannot read the output.
- Surface actionable messages in CI logs.

## Environment Tasks

- Define the shared output directory variable.
- Define the toolchain version variable.
- Define the build mode variable.
- Define the artifact retention variable.
- Define any backend access variable needed.
- Keep all env vars documented.

## Permission Tasks

- Ensure CI can write to the output folder.
- Ensure the backend can read from the output folder.
- Avoid unnecessary write permissions for the backend.
- Avoid broad filesystem permissions.
- Keep the access model minimal.

## Suggested Implementation Notes

- For the MVP, keep the output contract simple enough that the Go backend can load files directly from disk.
- Prefer one manifest schema for all tools rather than a custom schema per tool.
- Keep the browser-facing metadata in sync with the backend manifest fields.
- Prefer deterministic file names over generated names.

## Acceptance Criteria

- CI produces a WASM artifact for each MVP tool.
- CI produces a manifest and checksum for each artifact.
- CI publishes artifacts under `dist/tools/<tool_id>/`.
- The Go backend can read the manifest and resolve the artifact path.
- The browser-facing metadata matches the published artifact.
- A missing tool or checksum mismatch fails the pipeline.
