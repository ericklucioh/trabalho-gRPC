import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = join(scriptDir, '..', '..');
export const toolsWorkspace = join(repoRoot, 'tools');
export const distRoot = join(repoRoot, 'dist', 'tools');
export const outputRoot = process.env.WASM_OUTPUT_ROOT ?? distRoot;
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
