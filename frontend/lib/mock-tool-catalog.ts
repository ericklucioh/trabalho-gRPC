import { encodeBase64 } from './base64';
import { API_VERSION, type PrepareToolRequest, type PrepareToolResponse, type ToolId, type ToolManifest, type ToolSummary } from './contracts';

const TOOL_SUMMARIES: ToolSummary[] = [
  {
    toolId: 'json2yaml',
    displayName: 'JSON to YAML',
    description: 'Converte JSON estruturado em YAML legível.',
    latestVersion: '1.0.0',
    inputKind: 'text',
    outputKind: 'text',
    executionMode: 'client_wasm',
    supportedMimeTypes: ['application/json', 'text/plain'],
  },
  {
    toolId: 'yaml2json',
    displayName: 'YAML to JSON',
    description: 'Converte YAML em JSON formatado para revisão.',
    latestVersion: '1.0.0',
    inputKind: 'text',
    outputKind: 'text',
    executionMode: 'client_wasm',
    supportedMimeTypes: ['application/yaml', 'text/plain'],
  },
];

const TOOL_MANIFESTS: Record<ToolId, ToolManifest> = {
  json2yaml: {
    apiVersion: API_VERSION,
    toolId: 'json2yaml',
    toolName: 'JSON to YAML',
    moduleVersion: '1.0.0',
    entrypoint: 'convert_json_to_yaml',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/json', 'text/plain'],
    cacheTtlSeconds: 300,
    moduleSha256: 'mock-sha256-json2yaml',
    moduleSizeBytes: 4096,
  },
  yaml2json: {
    apiVersion: API_VERSION,
    toolId: 'yaml2json',
    toolName: 'YAML to JSON',
    moduleVersion: '1.0.0',
    entrypoint: 'convert_yaml_to_json',
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: ['application/yaml', 'text/plain'],
    cacheTtlSeconds: 300,
    moduleSha256: 'mock-sha256-yaml2json',
    moduleSizeBytes: 4096,
  },
};

function createMockBytes(toolId: ToolId): Uint8Array {
  const payload = `${toolId}:mock-wasm-package`;
  return new TextEncoder().encode(payload);
}

function buildResponse(manifest: ToolManifest): PrepareToolResponse {
  const wasmBytes = createMockBytes(manifest.toolId);
  return {
    apiVersion: API_VERSION,
    toolId: manifest.toolId,
    displayName: manifest.toolName,
    entrypoint: manifest.entrypoint,
    status: 'ready',
    statusMessage: 'Pacote WASM preparado para download no browser.',
    manifestUrl: `/api/tools/${manifest.toolId}/manifest`,
    downloadUrl: `/api/tools/${manifest.toolId}/package`,
    moduleVersion: manifest.moduleVersion,
    moduleSha256: manifest.moduleSha256,
    moduleSizeBytes: manifest.moduleSizeBytes,
    supportedMimeTypes: manifest.supportedMimeTypes,
    wasmBytesBase64: encodeBase64(wasmBytes),
  };
}

export async function listMockTools(): Promise<ToolSummary[]> {
  return TOOL_SUMMARIES;
}

export async function prepareMockTool(request: PrepareToolRequest): Promise<PrepareToolResponse> {
  if (request.apiVersion !== API_VERSION) {
    return {
      apiVersion: API_VERSION,
      toolId: request.toolId,
      displayName: request.toolId,
      entrypoint: '',
      status: 'rejected',
      statusMessage: 'Versão de contrato inválida para preparação da tool.',
      manifestUrl: '',
      downloadUrl: '',
      moduleVersion: '',
      moduleSha256: '',
      moduleSizeBytes: 0,
      supportedMimeTypes: [],
      wasmBytesBase64: '',
      error: {
        code: 'INVALID_VERSION',
        message: 'apiVersion must be v1',
        offendingValue: request.apiVersion,
        expectedShape: 'apiVersion=v1',
      },
    };
  }

  const manifest = TOOL_MANIFESTS[request.toolId];
  return buildResponse(manifest);
}

export function getMockManifest(toolId: ToolId): ToolManifest {
  return TOOL_MANIFESTS[toolId];
}

export function getMockModuleBytes(toolId: ToolId): Uint8Array {
  return createMockBytes(toolId);
}
