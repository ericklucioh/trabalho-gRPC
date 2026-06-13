import {
  API_VERSION,
  type PrepareToolRequest,
  type PrepareToolResponse,
  type ToolConfiguration,
  type ToolId,
  type ToolManifest,
  type ToolSummary,
} from './contracts';

export interface ToolCatalogAdapter {
  listTools(): Promise<ToolSummary[]>;
  prepareTool(request: PrepareToolRequest): Promise<PrepareToolResponse>;
}

export const mockToolCatalogAdapter: ToolCatalogAdapter = {
  async listTools() {
    const { listMockTools } = await import('./mock-tool-catalog');
    return listMockTools();
  },
  async prepareTool(request) {
    const { prepareMockTool } = await import('./mock-tool-catalog');
    return prepareMockTool(request);
  },
};

export function buildPrepareRequest(toolId: ToolId, clientRequestId: string): PrepareToolRequest {
  return {
    apiVersion: API_VERSION,
    toolId,
    clientRequestId,
    preferClientWasm: true,
  };
}

export function toToolConfiguration(
  request: PrepareToolResponse,
  manifest: ToolManifest,
  moduleBytes: Uint8Array,
): ToolConfiguration {
  return {
    toolId: request.toolId,
    toolLabel: request.displayName,
    manifest,
    moduleBytes,
    isConfigured: false,
    configuredAtIso: new Date().toISOString(),
  };
}
