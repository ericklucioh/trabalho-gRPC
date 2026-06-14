import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  apiVersion,
  assertToolWorkspaceAlignment,
  cacheTtlSeconds,
  cargoTargetDir,
  repoRoot,
  outputRoot,
  toolDefinitions,
  toolsWorkspace,
  wasmTarget,
} from './definitions.mjs';

function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildWorkspaceArtifacts() {
  execFileSync(
    'cargo',
    [
      'build',
      '--release',
      '--target',
      wasmTarget,
      '--manifest-path',
      join(toolsWorkspace, 'Cargo.toml'),
      ...toolDefinitions.flatMap((tool) => ['--package', tool.crateName]),
    ],
    { cwd: repoRoot, env: { ...process.env, CARGO_TARGET_DIR: cargoTargetDir }, stdio: 'inherit' }
  );
}

function packageTool(tool) {
  const targetFile = join(
    cargoTargetDir,
    'wasm32-unknown-unknown',
    'release',
    `${tool.crateName}.wasm`
  );
  const outputDir = join(outputRoot, tool.toolId);
  const outputFile = join(outputDir, 'module.wasm');
  const manifestFile = join(outputDir, 'manifest.json');
  const checksumFile = join(outputDir, 'sha256.txt');
  const wasmBytes = readFileSync(targetFile);
  const checksum = sha256Hex(wasmBytes);

  mkdirSync(outputDir, { recursive: true });
  copyFileSync(targetFile, outputFile);

  const manifest = {
    api_version: apiVersion,
    tool_id: tool.toolId,
    tool_name: tool.toolName,
    description: tool.description,
    module_version: tool.moduleVersion,
    module_sha256: checksum,
    module_size_bytes: wasmBytes.length,
    entrypoint: tool.entrypoint,
    input_kind: tool.inputKind,
    output_kind: tool.outputKind,
    supported_mime_types: tool.supportedMimeTypes,
    cache_ttl_seconds: cacheTtlSeconds,
    artifact_path: tool.artifactPath,
  };

  writeJson(manifestFile, manifest);
  writeFileSync(checksumFile, `${checksum}\n`);

  console.log(
    `packed ${tool.toolId} -> ${outputFile} (${wasmBytes.length} bytes, sha256 ${checksum})`
  );
}

function cleanOutput() {
  rmSync(outputRoot, { recursive: true, force: true });
}

function main() {
  assertToolWorkspaceAlignment();
  cleanOutput();
  mkdirSync(outputRoot, { recursive: true });
  buildWorkspaceArtifacts();

  for (const tool of toolDefinitions) {
    packageTool(tool);
  }
}

main();
