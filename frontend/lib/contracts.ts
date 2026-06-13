export const API_VERSION = 'v1' as const;

export type ToolId = 'json2yaml' | 'yaml2json';
export type ToolExecutionMode = 'client_wasm';
export type ToolInputKind = 'text';
export type ToolOutputKind = 'text';
export type ToolStatus = 'idle' | 'loading' | 'ready' | 'configured' | 'failed';
export type ResultFormat = 'json' | 'yaml';
export type ParsedContentKind = 'json' | 'yaml';

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
  inputKind: ToolInputKind;
  outputKind: ToolOutputKind;
  executionMode: ToolExecutionMode;
  supportedMimeTypes: string[];
}

export interface ToolManifest {
  apiVersion: typeof API_VERSION;
  toolId: ToolId;
  toolName: string;
  moduleVersion: string;
  entrypoint: string;
  inputKind: ToolInputKind;
  outputKind: ToolOutputKind;
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
  status: 'ready' | 'loading' | 'rejected' | 'failed';
  statusMessage: string;
  manifestUrl: string;
  downloadUrl: string;
  moduleVersion: string;
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
  outputFormat: ResultFormat;
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
  requestId: string | null;
  requestStartedAtIso: string | null;
  requestDurationMs: number | null;
  configuredTool: ToolConfiguration | null;
}
