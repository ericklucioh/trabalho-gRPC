export const PROTO_API_VERSION = 'v1' as const;

export interface ProtoTypedError {
  code: string;
  message: string;
  offendingValue: string;
  expectedShape: string;
}

export interface ListToolsRequest {
  apiVersion: typeof PROTO_API_VERSION;
  clientRequestId: string;
}

export interface ListToolsResponse {
  apiVersion: typeof PROTO_API_VERSION;
  tools: ProtoToolSummary[];
  error?: ProtoTypedError;
}

export interface GetToolPackageRequest {
  apiVersion: typeof PROTO_API_VERSION;
  toolId: string;
  clientRequestId: string;
}

export interface GetToolPackageResponse {
  apiVersion: typeof PROTO_API_VERSION;
  toolId: string;
  toolName: string;
  description: string;
  moduleVersion: string;
  entrypoint: string;
  inputKind: 'text' | 'file' | 'structured';
  outputKind: 'text' | 'file' | 'structured';
  supportedMimeTypes: string[];
  cacheTtlSeconds: number;
  wasmBytes: Uint8Array;
  wasmSha256: string;
  wasmSizeBytes: number;
  error?: ProtoTypedError;
}

export interface ProtoToolSummary {
  toolId: string;
  displayName: string;
  description: string;
  latestVersion: string;
}
