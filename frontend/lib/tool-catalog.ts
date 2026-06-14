import {
  API_VERSION,
  type PrepareToolRequest,
  type PrepareToolResponse,
  type ToolId,
  type ToolSummary,
} from './contracts';
import { decodeBase64 } from './base64';

export interface ToolCatalogAdapter {
  listTools(): Promise<ToolSummary[]>;
  prepareTool(request: PrepareToolRequest): Promise<PrepareToolResponse>;
}

export const httpToolCatalogAdapter: ToolCatalogAdapter = {
  async listTools() {
    const response = await fetch('/api/tools', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return parseListToolsResponse(response);
  },
  async prepareTool(request) {
    const response = await fetch(`/api/tools/${request.toolId}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
    });
    return parsePrepareToolResponse(response);
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

function parseListToolsResponse(response: Response): Promise<ToolSummary[]> {
  return parseJsonResponse<{ apiVersion: string; tools: ToolSummary[] }>(response).then((body) => body.tools);
}

function parsePrepareToolResponse(response: Response): Promise<PrepareToolResponse> {
  return parseJsonResponse<PrepareToolResponse>(response);
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(buildTransportErrorMessage(response.status, text));
  }

  const body: unknown = await response.json();
  return validateResponse<T>(body);
}

function validateResponse<T>(value: unknown): T {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Expected JSON object, received ${String(value)}.`);
  }

  return value as T;
}

function buildTransportErrorMessage(status: number, body: string): string {
  const trimmedBody = body.trim();
  if (trimmedBody.length === 0) {
    return `Request failed with status ${status}.`;
  }

  return `Request failed with status ${status}: ${trimmedBody}`;
}

export function decodeToolBytes(response: PrepareToolResponse): Uint8Array {
  if (response.wasmBytesBase64.length === 0) {
    throw new Error(`Expected wasmBytesBase64 for tool ${response.toolId}.`);
  }

  return decodeBase64(response.wasmBytesBase64);
}
