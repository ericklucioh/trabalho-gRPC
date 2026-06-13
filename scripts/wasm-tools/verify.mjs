import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import {
  apiVersion,
  assertToolWorkspaceAlignment,
  cacheTtlSeconds,
  outputRoot,
  toolDefinitions,
} from './definitions.mjs';

function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function verifyTool(tool) {
  const outputDir = join(outputRoot, tool.toolId);
  const wasmFile = join(outputDir, 'module.wasm');
  const manifestFile = join(outputDir, 'manifest.json');
  const metadataFile = join(outputDir, 'metadata.json');
  const checksumFile = join(outputDir, 'sha256.txt');
  const wasmBytes = readFileSync(wasmFile);
  const manifest = readJson(manifestFile);
  const metadata = readJson(metadataFile);
  const checksum = readFileSync(checksumFile, 'utf8').trim();
  const computedChecksum = sha256Hex(wasmBytes);

  if (!WebAssembly.validate(wasmBytes)) {
    throw new Error(`Invalid WebAssembly module for tool ${tool.toolId}`);
  }

  if (checksum !== computedChecksum) {
    throw new Error(
      `Checksum mismatch for ${tool.toolId}: expected ${checksum}, got ${computedChecksum}`
    );
  }

  if (manifest.api_version !== apiVersion) {
    throw new Error(`Unexpected api_version for ${tool.toolId}: ${manifest.api_version}`);
  }

  if (manifest.tool_id !== tool.toolId) {
    throw new Error(`Unexpected tool_id for ${tool.toolId}: ${manifest.tool_id}`);
  }

  if (manifest.module_sha256 !== computedChecksum) {
    throw new Error(`Manifest checksum mismatch for ${tool.toolId}`);
  }

  if (manifest.module_size_bytes !== wasmBytes.length) {
    throw new Error(`Manifest size mismatch for ${tool.toolId}`);
  }

  if (manifest.module_url !== './module.wasm') {
    throw new Error(`Unexpected module_url for ${tool.toolId}: ${manifest.module_url}`);
  }

  if (manifest.entrypoint !== tool.entrypoint) {
    throw new Error(`Unexpected entrypoint for ${tool.toolId}: ${manifest.entrypoint}`);
  }

  if (manifest.cache_ttl_seconds !== cacheTtlSeconds) {
    throw new Error(`Unexpected cache_ttl_seconds for ${tool.toolId}`);
  }

  if (metadata.tool_id !== tool.toolId || metadata.crate_name !== tool.crateName) {
    throw new Error(`Metadata mismatch for ${tool.toolId}`);
  }

  console.log(`verified ${tool.toolId} -> ${wasmFile}`);
}

function main() {
  assertToolWorkspaceAlignment();

  for (const tool of toolDefinitions) {
    verifyTool(tool);
  }
}

main();
