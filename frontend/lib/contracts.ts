export const API_VERSION = 'v1' as const;

export type ToolId = string;
export type ToolStatus = 'idle' | 'loading' | 'ready' | 'configured' | 'failed';

export interface TypedError {
  code: string;
  message: string;
  offendingValue?: string;
  expectedShape?: string;
}

export interface ToolSummary {
  toolId: ToolId;
  displayName: string;
  description: string;
  latestVersion: string;
}

export interface ToolManifest {
  apiVersion: typeof API_VERSION;
  toolId: ToolId;
  toolName: string;
  moduleVersion: string;
  entrypoint: string;
  inputKind: string;
  outputKind: string;
  supportedMimeTypes: string[];
  cacheTtlSeconds: number;
  moduleSha256: string;
  moduleSizeBytes: number;
}

export interface ToolPackage extends ToolManifest {
  moduleBytes: Uint8Array;
}

export interface PrepareToolRequest {
  apiVersion: typeof API_VERSION;
  toolId: ToolId;
  clientRequestId: string;
  preferClientWasm: true;
}

export interface PrepareToolResponse {
  apiVersion: typeof API_VERSION;
  toolId: ToolId;
  displayName: string;
  entrypoint: string;
  inputKind: string;
  outputKind: string;
  status: 'ready' | 'loading' | 'rejected' | 'failed';
  statusMessage: string;
  moduleVersion: string;
  cacheTtlSeconds: number;
  moduleSha256: string;
  moduleSizeBytes: number;
  supportedMimeTypes: string[];
  wasmBytesBase64: string;
  error?: TypedError;
}

export interface ToolExecutionRequest {
  toolId: ToolId;
  inputText: string;
}

export interface ToolExecutionResult {
  outputText: string;
}

export interface ToolConfiguration {
  toolId: ToolId;
  toolLabel: string;
  manifest: ToolManifest;
  moduleBytes: Uint8Array;
  isConfigured: boolean;
  configuredAtIso: string;
}

export interface ToolWorkbenchSnapshot {
  selectedToolId: ToolId | null;
  selectedToolLabel: string;
  toolStatus: ToolStatus;
  isCatalogLoading: boolean;
  isConfiguring: boolean;
  isSubmitting: boolean;
  isConfigured: boolean;
  statusMessage: string;
  errorMessage: string | null;
  inputValue: string;
  outputValue: string;
  configuredTool: ToolConfiguration | null;
}
