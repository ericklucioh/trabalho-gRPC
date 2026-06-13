import type { ToolExecutionMode, ToolId, ToolInputKind, ToolOutputKind } from './contracts';

export interface ToolCatalogMetadata {
  inputKind: ToolInputKind;
  outputKind: ToolOutputKind;
  executionMode: ToolExecutionMode;
  supportedMimeTypes: string[];
}

export function getToolCatalogMetadata(toolId: ToolId): ToolCatalogMetadata {
  switch (toolId) {
    case 'json2yaml':
      return {
        inputKind: 'text',
        outputKind: 'text',
        executionMode: 'client_wasm',
        supportedMimeTypes: ['application/json', 'text/plain'],
      };
    case 'yaml2json':
      return {
        inputKind: 'text',
        outputKind: 'text',
        executionMode: 'client_wasm',
        supportedMimeTypes: ['application/yaml', 'text/plain'],
      };
  }
}
