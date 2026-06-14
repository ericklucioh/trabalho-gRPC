import 'server-only';

import { API_VERSION, type PrepareToolRequest, type PrepareToolResponse, type ToolSummary } from './contracts';
import { encodeBase64 } from './base64';
import { getToolPackageFromGo, listToolsFromGo } from './go-grpc-client';

export async function listBrowserTools(): Promise<ToolSummary[]> {
  return listToolsFromGo();
}

export async function prepareBrowserTool(request: PrepareToolRequest): Promise<PrepareToolResponse> {
  const toolPackage = await getToolPackageFromGo(request.toolId);
  return toPrepareResponse(toolPackage);
}

function toPrepareResponse(toolPackage: Awaited<ReturnType<typeof getToolPackageFromGo>>): PrepareToolResponse {
  return {
    apiVersion: API_VERSION,
    toolId: toolPackage.toolId,
    displayName: toolPackage.toolName,
    entrypoint: toolPackage.entrypoint,
    inputKind: toolPackage.inputKind,
    outputKind: toolPackage.outputKind,
    status: 'ready',
    statusMessage: 'Pacote WASM recebido do backend.',
    moduleVersion: toolPackage.moduleVersion,
    cacheTtlSeconds: toolPackage.cacheTtlSeconds,
    moduleSha256: toolPackage.wasmSha256,
    moduleSizeBytes: toolPackage.wasmSizeBytes,
    supportedMimeTypes: toolPackage.supportedMimeTypes,
    wasmBytesBase64: encodeBase64(toolPackage.wasmBytes),
  };
}
