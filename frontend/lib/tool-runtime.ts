import { type ResultFormat, type ToolConfiguration, type ToolExecutionRequest, type ToolExecutionResult, type ToolId } from './contracts';

export interface ToolRuntimeAdapter {
  loadToolPackage(configuration: ToolConfiguration): Promise<ToolConfiguration>;
  execute(request: ToolExecutionRequest, configuration: ToolConfiguration): Promise<ToolExecutionResult>;
}

interface WasmToolExports {
  memory: WebAssembly.Memory;
  wasm_alloc: (length: number) => number;
  wasm_free: (ptr: number, length: number) => void;
  convert: (ptr: number, length: number) => number;
  last_error_ptr: () => number;
  last_error_len: () => number;
}

interface WasmToolSession {
  exports: WasmToolExports;
  memory: WebAssembly.Memory;
  alloc: (length: number) => number;
  free: (ptr: number, length: number) => void;
  convert: (ptr: number, length: number) => number;
  lastErrorPtr: () => number;
  lastErrorLen: () => number;
}

export class WasmToolRuntimeAdapter implements ToolRuntimeAdapter {
  private readonly sessions = new WeakMap<ToolConfiguration, WasmToolSession>();

  async loadToolPackage(configuration: ToolConfiguration): Promise<ToolConfiguration> {
    const session = await instantiateWasmTool(configuration);
    const loadedConfiguration = {
      ...configuration,
      isConfigured: true,
    };

    this.sessions.set(loadedConfiguration, session);
    return loadedConfiguration;
  }

  async execute(request: ToolExecutionRequest, configuration: ToolConfiguration): Promise<ToolExecutionResult> {
    const session = this.sessions.get(configuration);
    if (!session) {
      throw new Error(`Tool ${request.toolId} is not configured.`);
    }

    const encoder = new TextEncoder();
    const inputBytes = encoder.encode(request.inputText);
    const inputAllocationSize = Math.max(1, inputBytes.length);
    const inputPtr = session.alloc(inputAllocationSize);

    if (inputPtr === 0) {
      throw new Error(`Failed to allocate WASM input buffer for ${request.toolId}.`);
    }

    try {
      writeBytes(session.memory, inputPtr, inputBytes);
      const outputPtr = session.convert(inputPtr, inputBytes.length);
      if (outputPtr === 0) {
        throw new Error(readLastError(session));
      }

      const outputBytes = readNullTerminatedBytes(session.memory, outputPtr);
      const outputText = new TextDecoder().decode(outputBytes);

      return {
        outputText,
        outputFormat: getOutputFormat(request.toolId),
      };
    } finally {
      session.free(inputPtr, inputAllocationSize);
    }
  }
}

async function instantiateWasmTool(configuration: ToolConfiguration): Promise<WasmToolSession> {
  if (configuration.moduleBytes.byteLength === 0) {
    throw new Error(`Expected non-empty module bytes for ${configuration.toolId}.`);
  }

  const { instance } = await WebAssembly.instantiate(configuration.moduleBytes, {});
  const exports = instance.exports as Partial<WasmToolExports> & Record<string, unknown>;
  const memory = exports.memory;

  if (!(memory instanceof WebAssembly.Memory)) {
    throw new Error(`Expected exported memory for ${configuration.toolId}.`);
  }

  const alloc = toExportedFunction(exports.wasm_alloc, 'wasm_alloc', configuration.toolId);
  const free = toExportedFunction(exports.wasm_free, 'wasm_free', configuration.toolId);
  const convert = toExportedFunction(exports.convert, 'convert', configuration.toolId);
  const lastErrorPtr = toExportedFunction(exports.last_error_ptr, 'last_error_ptr', configuration.toolId);
  const lastErrorLen = toExportedFunction(exports.last_error_len, 'last_error_len', configuration.toolId);

    return {
    exports: {
      memory,
      wasm_alloc: alloc,
      wasm_free: free,
      convert,
      last_error_ptr: lastErrorPtr,
      last_error_len: lastErrorLen,
    },
    memory,
    alloc,
    free,
    convert,
    lastErrorPtr,
    lastErrorLen,
  };
}

function toExportedFunction(
  value: unknown,
  exportName: string,
  toolId: ToolId,
): (...args: number[]) => number {
  if (typeof value !== 'function') {
    throw new Error(`Expected WASM export ${exportName} for ${toolId}.`);
  }

  return value as (...args: number[]) => number;
}

function writeBytes(memory: WebAssembly.Memory, ptr: number, bytes: Uint8Array): void {
  const view = new Uint8Array(memory.buffer, ptr, bytes.length);
  view.set(bytes);
}

function readNullTerminatedBytes(memory: WebAssembly.Memory, ptr: number): Uint8Array {
  const bytes = new Uint8Array(memory.buffer);
  let end = ptr;

  while (end < bytes.length && bytes[end] !== 0) {
    end += 1;
  }

  if (end >= bytes.length) {
    throw new Error('WASM output was not null-terminated.');
  }

  return bytes.slice(ptr, end);
}

function readLastError(session: WasmToolSession): string {
  const ptr = session.lastErrorPtr();
  const length = session.lastErrorLen();
  if (ptr === 0 || length === 0) {
    return 'WASM conversion failed without an error message.';
  }

  const bytes = new Uint8Array(session.memory.buffer, ptr, length);
  return new TextDecoder().decode(bytes);
}

function getOutputFormat(toolId: ToolId): ResultFormat {
  return toolId === 'json2yaml' ? 'yaml' : 'json';
}
