import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = join(scriptDir, '..', '..');
export const toolsWorkspace = join(repoRoot, 'tools');
export const backendArtifactsRoot = join(repoRoot, 'backend', 'artifacts');
export const outputRoot = process.env.WASM_OUTPUT_ROOT ?? backendArtifactsRoot;
export const cargoTargetDir = process.env.CARGO_TARGET_DIR ?? join('/tmp', 'trabalho-grpc-wasm-target');
export const wasmTarget = 'wasm32-unknown-unknown';
export const apiVersion = 'v1';
export const cacheTtlSeconds = 86_400;

export const toolDefinitions = [
  {
    toolId: 'json2yaml',
    toolName: 'JSON to YAML',
    description: 'Convert JSON text into YAML text.',
    crateName: 'json2yaml',
    cratePath: 'tools/json2yaml',
    moduleVersion: '0.1.0',
    entrypoint: 'convert_json_to_yaml',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/json', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'json2toml',
    toolName: 'JSON to TOML',
    description: 'Convert JSON text into TOML text.',
    crateName: 'json2toml',
    cratePath: 'tools/json2toml',
    moduleVersion: '0.1.0',
    entrypoint: 'convert_json_to_toml',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/json', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'json-pretty',
    toolName: 'JSON Pretty',
    description: 'Format JSON text with stable indentation.',
    crateName: 'json-pretty',
    cratePath: 'tools/json-pretty',
    moduleVersion: '0.1.0',
    entrypoint: 'format_json_pretty',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/json', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'json-minify',
    toolName: 'JSON Minify',
    description: 'Remove unnecessary whitespace from JSON text.',
    crateName: 'json-minify',
    cratePath: 'tools/json-minify',
    moduleVersion: '0.1.0',
    entrypoint: 'minify_json',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/json', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'toml2json',
    toolName: 'TOML to JSON',
    description: 'Convert TOML text into JSON text.',
    crateName: 'toml2json',
    cratePath: 'tools/toml2json',
    moduleVersion: '0.1.0',
    entrypoint: 'convert_toml_to_json',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/toml', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'yaml2json',
    toolName: 'YAML to JSON',
    description: 'Convert YAML text into formatted JSON text.',
    crateName: 'yaml2json',
    cratePath: 'tools/yaml2json',
    moduleVersion: '0.1.0',
    entrypoint: 'convert_yaml_to_json',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/yaml', 'text/yaml', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'yaml-pretty',
    toolName: 'YAML Pretty',
    description: 'Format YAML text with stable indentation.',
    crateName: 'yaml-pretty',
    cratePath: 'tools/yaml-pretty',
    moduleVersion: '0.1.0',
    entrypoint: 'format_yaml_pretty',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/yaml', 'text/yaml', 'text/plain'],
    artifactPath: 'module.wasm',
  },
  {
    toolId: 'yaml-minify',
    toolName: 'YAML Minify',
    description: 'Normalize YAML text into a compact form.',
    crateName: 'yaml-minify',
    cratePath: 'tools/yaml-minify',
    moduleVersion: '0.1.0',
    entrypoint: 'minify_yaml',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/yaml', 'text/yaml', 'text/plain'],
    artifactPath: 'module.wasm',
  },
];

export function readWorkspaceMembers() {
  const cargoToml = readFileSync(join(toolsWorkspace, 'Cargo.toml'), 'utf8');
  const membersMatch = cargoToml.match(/members\s*=\s*\[([^\]]*)\]/s);

  if (!membersMatch) {
    throw new Error('Could not find workspace members in tools/Cargo.toml');
  }

  return [...membersMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

export function assertToolWorkspaceAlignment() {
  const workspaceMembers = readWorkspaceMembers();
  const definedMembers = toolDefinitions.map((tool) => tool.crateName);

  if (workspaceMembers.length !== definedMembers.length) {
    throw new Error(
      `Expected ${definedMembers.length} workspace members, got ${workspaceMembers.length}: ${workspaceMembers.join(', ')}`
    );
  }

  for (const member of definedMembers) {
    if (!workspaceMembers.includes(member)) {
      throw new Error(`Missing workspace member for tool ${member}`);
    }
  }
}
