import 'server-only';

import { loadPackageDefinition, credentials, type ChannelCredentials, type Client, type ClientOptions, type ClientUnaryCall, type PackageDefinition, type ServiceError, type ServiceClientConstructor, type UnaryCallback } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { join } from 'node:path';

import { API_VERSION, type ToolId } from './contracts';

interface ProtoListToolsResponse {
  api_version: string;
  tools: ProtoToolSummary[];
  error?: ProtoTypedError;
}

interface ProtoGetToolPackageResponse {
  api_version: string;
  tool_id: string;
  tool_name: string;
  description: string;
  module_version: string;
  entrypoint: string;
  input_kind: string;
  output_kind: string;
  supported_mime_types: string[];
  cache_ttl_seconds: number;
  wasm_bytes: Uint8Array;
  wasm_sha256: string;
  wasm_size_bytes: number;
  error?: ProtoTypedError;
}

interface ProtoToolSummary {
  tool_id: string;
  display_name: string;
  description: string;
  latest_version: string;
}

interface ProtoTypedError {
  code: string;
  message: string;
  offending_value: string;
  expected_shape: string;
}

interface ToolCatalogServiceClient extends Client {
  ListTools(request: ProtoListToolsRequest, callback: UnaryCallback<ProtoListToolsResponse>): ClientUnaryCall;
  GetToolPackage(request: ProtoGetToolPackageRequest, callback: UnaryCallback<ProtoGetToolPackageResponse>): ClientUnaryCall;
}

interface ProtoRoot {
  lojinha: {
    wasm: {
      v1: {
        ToolCatalogService: ToolCatalogServiceClientConstructor;
      };
    };
  };
}

interface ToolCatalogServiceClientConstructor extends ServiceClientConstructor {
  new (address: string, credentials: ChannelCredentials, options?: ClientOptions): ToolCatalogServiceClient;
}

export interface BrowserToolSummary {
  toolId: ToolId;
  displayName: string;
  description: string;
  latestVersion: string;
}

export interface BrowserToolPackage {
  apiVersion: typeof API_VERSION;
  toolId: ToolId;
  toolName: string;
  description: string;
  moduleVersion: string;
  entrypoint: string;
  inputKind: string;
  outputKind: string;
  supportedMimeTypes: string[];
  cacheTtlSeconds: number;
  wasmBytes: Uint8Array;
  wasmSha256: string;
  wasmSizeBytes: number;
}

const PROTO_PATH = join(process.cwd(), 'proto', 'lojinhawasm', 'v1', 'tool_catalog.proto');
const GRPC_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
} as const;

let clientConstructor: ToolCatalogServiceClientConstructor | null = null;

function getClientConstructor(): ToolCatalogServiceClientConstructor {
  if (clientConstructor) {
    return clientConstructor;
  }

  const packageDefinition = loadSync(PROTO_PATH, GRPC_OPTIONS) as PackageDefinition;
  const loaded = loadPackageDefinition(packageDefinition) as unknown as ProtoRoot;
  clientConstructor = loaded.lojinha.wasm.v1.ToolCatalogService;

  return clientConstructor;
}

function getClient(): ToolCatalogServiceClient {
  const endpoint = process.env.GRPC_ENDPOINT ?? '127.0.0.1:50051';
  return new (getClientConstructor())(endpoint, credentials.createInsecure());
}

export async function listToolsFromGo(): Promise<BrowserToolSummary[]> {
  const response = await withClient((client) =>
    unaryRequest<ProtoListToolsResponse>((callback) =>
      client.ListTools(
        {
          api_version: API_VERSION,
          client_request_id: createRequestId(),
        },
        callback,
      ),
      ),
  );

  if (response.error) {
    throw toTypedError(response.error);
  }

  return response.tools.map(toBrowserToolSummary);
}

export async function getToolPackageFromGo(toolId: ToolId): Promise<BrowserToolPackage> {
  const response = await withClient((client) =>
    unaryRequest<ProtoGetToolPackageResponse>((callback) =>
      client.GetToolPackage(
        {
          api_version: API_VERSION,
          tool_id: toolId,
          client_request_id: createRequestId(),
        },
        callback,
      ),
      ),
  );

  if (response.error) {
    throw toTypedError(response.error);
  }

  return toBrowserToolPackage(response);
}

async function withClient<ResponseShape>(operation: (client: ToolCatalogServiceClient) => Promise<ResponseShape>): Promise<ResponseShape> {
  const client = getClient();
  try {
    return await operation(client);
  } finally {
    client.close();
  }
}

function unaryRequest<ResponseShape>(
  invoke: (callback: UnaryCallback<ResponseShape>) => ClientUnaryCall,
): Promise<ResponseShape> {
  return new Promise<ResponseShape>((resolve, reject) => {
    invoke((error: ServiceError | null, response: ResponseShape) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

function toBrowserToolSummary(tool: ProtoToolSummary): BrowserToolSummary {
  return {
    toolId: tool.tool_id as ToolId,
    displayName: tool.display_name,
    description: tool.description,
    latestVersion: tool.latest_version,
  };
}

function toBrowserToolPackage(response: ProtoGetToolPackageResponse): BrowserToolPackage {
  return {
    apiVersion: API_VERSION,
    toolId: response.tool_id as ToolId,
    toolName: response.tool_name,
    description: response.description,
    moduleVersion: response.module_version,
    entrypoint: response.entrypoint,
    inputKind: response.input_kind,
    outputKind: response.output_kind,
    supportedMimeTypes: response.supported_mime_types,
    cacheTtlSeconds: response.cache_ttl_seconds,
    wasmBytes: response.wasm_bytes,
    wasmSha256: response.wasm_sha256,
    wasmSizeBytes: response.wasm_size_bytes,
  };
}

function createRequestId(): string {
  return `req_${crypto.getRandomValues(new Uint32Array(4)).join('')}`;
}

function toTypedError(error: ProtoTypedError): Error {
  return new Error(`${error.code}: ${error.message} (value: ${error.offending_value}, expected: ${error.expected_shape})`);
}
