import 'server-only';

import { API_VERSION, type PrepareToolRequest, type PrepareToolResponse, type ToolId, type ToolManifest, type ToolSummary } from './contracts';
import { encodeBase64 } from './base64';
import { getToolCatalogMetadata } from './tool-metadata';
import { type BrowserToolSummary, getToolPackageFromGo, listToolsFromGo } from './go-grpc-client';

export async function listBrowserTools(): Promise<ToolSummary[]> {
  const tools = await listToolsFromGo();
  return tools.map(enrichToolSummary);
}

export async function prepareBrowserTool(request: PrepareToolRequest): Promise<PrepareToolResponse> {
  const toolPackage = await getToolPackageFromGo(request.toolId);
  return toPrepareResponse(toolPackage);
}

export async function readBrowserToolManifest(toolId: ToolId): Promise<ToolManifest> {
  const toolPackage = await getToolPackageFromGo(toolId);
  return toManifest(toolPackage);
}

export async function readBrowserToolPackage(toolId: ToolId): Promise<Uint8Array> {
  const toolPackage = await getToolPackageFromGo(toolId);
  return toolPackage.wasmBytes;
}

function enrichToolSummary(tool: BrowserToolSummary): ToolSummary {
  const metadata = getToolCatalogMetadata(tool.toolId);
  return {
    ...tool,
    inputKind: metadata.inputKind,
    outputKind: metadata.outputKind,
    executionMode: metadata.executionMode,
    supportedMimeTypes: metadata.supportedMimeTypes,
  };
}

function toPrepareResponse(toolPackage: Awaited<ReturnType<typeof getToolPackageFromGo>>): PrepareToolResponse {
  return {
    apiVersion: API_VERSION,
    toolId: toolPackage.toolId,
    displayName: toolPackage.toolName,
    entrypoint: toolPackage.entrypoint,
    status: 'ready',
    statusMessage: 'Pacote WASM recebido do backend.',
    manifestUrl: `/api/tools/${toolPackage.toolId}/manifest`,
    downloadUrl: `/api/tools/${toolPackage.toolId}/package`,
    moduleVersion: toolPackage.moduleVersion,
    moduleSha256: toolPackage.wasmSha256,
    moduleSizeBytes: toolPackage.wasmSizeBytes,
    supportedMimeTypes: toolPackage.supportedMimeTypes,
    wasmBytesBase64: encodeBase64(toolPackage.wasmBytes),
  };
}

function toManifest(toolPackage: Awaited<ReturnType<typeof getToolPackageFromGo>>): ToolManifest {
  return {
    apiVersion: API_VERSION,
    toolId: toolPackage.toolId,
    toolName: toolPackage.toolName,
    moduleVersion: toolPackage.moduleVersion,
    entrypoint: toolPackage.entrypoint,
    inputKind: 'text',
    outputKind: 'text',
    supportedMimeTypes: toolPackage.supportedMimeTypes,
    cacheTtlSeconds: toolPackage.cacheTtlSeconds,
    moduleSha256: toolPackage.wasmSha256,
    moduleSizeBytes: toolPackage.wasmSizeBytes,
  };
}
