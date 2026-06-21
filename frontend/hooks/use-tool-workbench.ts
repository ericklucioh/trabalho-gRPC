import { useEffect, useState } from 'react';

import { createRequestId } from '../lib/request-id';
import {
  API_VERSION,
  type ToolConfiguration,
  type ToolId,
  type ToolStatus,
  type ToolSummary,
  type ToolManifest,
} from '../lib/contracts';
import { buildPrepareRequest, decodeToolBytes, httpToolCatalogAdapter, type ToolCatalogAdapter } from '../lib/tool-catalog';
import { WasmToolRuntimeAdapter, type ToolRuntimeAdapter } from '../lib/tool-runtime';

const defaultRuntimeAdapter = new WasmToolRuntimeAdapter();

export interface UseToolWorkbenchOptions {
  catalogAdapter?: ToolCatalogAdapter;
  runtimeAdapter?: ToolRuntimeAdapter;
}

export interface UseToolWorkbenchReturn {
  tools: ToolSummary[];
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
  inputError: string | null;
  selectTool: (toolId: ToolId) => void;
  configureSelectedTool: () => Promise<void>;
  setInputValue: (value: string) => void;
  submitInput: () => Promise<void>;
}

export function useToolWorkbench(options: UseToolWorkbenchOptions = {}): UseToolWorkbenchReturn {
  const catalogAdapter = options.catalogAdapter ?? httpToolCatalogAdapter;
  const runtimeAdapter = options.runtimeAdapter ?? defaultRuntimeAdapter;

  const [tools, setTools] = useState<ToolSummary[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);
  const [configuredTool, setConfiguredTool] = useState<ToolConfiguration | null>(null);
  const [toolStatus, setToolStatus] = useState<ToolStatus>('idle');
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading tool catalog.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadTools(): Promise<void> {
      setIsCatalogLoading(true);
      console.info('[frontend/workbench] catalog load started');
      try {
        const fetchedTools = await catalogAdapter.listTools();
        if (!isActive) {
          return;
        }

        console.info('[frontend/workbench] catalog load completed', {
          toolCount: fetchedTools.length,
        });
        setTools(fetchedTools);
        setSelectedToolId((current) => current ?? fetchedTools[0]?.toolId ?? null);
        setStatusMessage('Catalog loaded. Select a tool to configure.');
        setToolStatus('ready');
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.info('[frontend/workbench] catalog load failed', {
          error: getErrorMessage(error),
        });
        setToolStatus('failed');
        setErrorMessage(getErrorMessage(error));
        setStatusMessage('Failed to load catalog.');
      } finally {
        if (isActive) {
          setIsCatalogLoading(false);
        }
      }
    }

    void loadTools();

    return () => {
      isActive = false;
    };
  }, [catalogAdapter]);

  const selectedTool = tools.find((tool) => tool.toolId === selectedToolId) ?? null;

  function selectTool(toolId: ToolId): void {
    console.info('[frontend/workbench] tool selected', { toolId });
    setSelectedToolId(toolId);
    setConfiguredTool(null);
    setOutputValue('');
    setErrorMessage(null);
    setInputError(null);
    setStatusMessage(`Selected tool: ${toolId}.`);
    setToolStatus('ready');
  }

  async function configureSelectedTool(): Promise<void> {
    if (!selectedToolId) {
      setErrorMessage('Select a tool before configuring it.');
      return;
    }

    setIsConfiguring(true);
    setErrorMessage(null);
    setStatusMessage('Requesting the real WASM package through Next.');
    setToolStatus('loading');

    const clientRequestId = createRequestId();
    console.info('[frontend/workbench] tool prepare started', {
      toolId: selectedToolId,
      clientRequestId,
    });
    const prepareRequest = buildPrepareRequest(selectedToolId, clientRequestId);

    try {
      const prepareResponse = await catalogAdapter.prepareTool(prepareRequest);
      if (prepareResponse.status !== 'ready') {
        throw new Error(prepareResponse.statusMessage);
      }

      console.info('[frontend/workbench] tool package received', {
        toolId: prepareResponse.toolId,
        clientRequestId,
        wasmSizeBytes: prepareResponse.moduleSizeBytes,
      });
      const manifest = buildToolManifest(prepareResponse);
      const moduleBytes = decodeToolBytes(prepareResponse);
      const nextConfiguration: ToolConfiguration = {
        toolId: prepareResponse.toolId,
        toolLabel: prepareResponse.displayName,
        manifest,
        moduleBytes,
        isConfigured: false,
        configuredAtIso: new Date().toISOString(),
      };
      const loadedConfiguration = await runtimeAdapter.loadToolPackage(nextConfiguration);

      console.info('[frontend/workbench] tool configured', {
        toolId: loadedConfiguration.toolId,
        clientRequestId,
      });
      setConfiguredTool(loadedConfiguration);
      setToolStatus('configured');
      setStatusMessage('Tool configured with the real WASM package.');
      setInputError(null);
    } catch (error) {
      console.info('[frontend/workbench] tool prepare failed', {
        toolId: selectedToolId,
        clientRequestId,
        error: getErrorMessage(error),
      });
      setToolStatus('failed');
      setErrorMessage(getErrorMessage(error));
      setStatusMessage('Failed to configure the tool.');
    } finally {
      setIsConfiguring(false);
    }
  }

  async function submitInput(): Promise<void> {
    if (!selectedToolId || !configuredTool) {
      setErrorMessage('Configure the tool before submitting text.');
      return;
    }

    setIsSubmitting(true);
    setInputError(null);
    setErrorMessage(null);
    setOutputValue('');

    try {
      console.info('[frontend/workbench] tool execution started', {
        toolId: selectedToolId,
      });
      setStatusMessage('Running WASM in the browser.');
      const result = await runtimeAdapter.execute(
        {
          toolId: selectedToolId,
          inputText: inputValue,
        },
        configuredTool,
      );
      console.info('[frontend/workbench] tool execution completed', {
        toolId: selectedToolId,
        outputLength: result.outputText.length,
      });
      setOutputValue(result.outputText);
      setStatusMessage('Conversion completed by the WASM downloaded through gRPC.');
    } catch (error) {
      console.info('[frontend/workbench] tool execution failed', {
        toolId: selectedToolId,
        error: getErrorMessage(error),
      });
      setErrorMessage(getErrorMessage(error));
      setStatusMessage('Failed to process the input.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    tools,
    selectedToolId,
    selectedToolLabel: selectedTool?.displayName ?? 'No tool selected',
    toolStatus,
    isCatalogLoading,
    isConfiguring,
    isSubmitting,
    isConfigured: configuredTool?.isConfigured ?? false,
    statusMessage,
    errorMessage,
    inputValue,
    outputValue,
    configuredTool,
    inputError,
    selectTool,
    configureSelectedTool,
    setInputValue,
    submitInput,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error.';
}

function buildToolManifest(prepareResponse: Awaited<ReturnType<ToolCatalogAdapter['prepareTool']>>): ToolManifest {
  return {
    apiVersion: API_VERSION,
    toolId: prepareResponse.toolId,
    toolName: prepareResponse.displayName,
    moduleVersion: prepareResponse.moduleVersion,
    entrypoint: prepareResponse.entrypoint,
    inputKind: prepareResponse.inputKind,
    outputKind: prepareResponse.outputKind,
    supportedMimeTypes: prepareResponse.supportedMimeTypes,
    cacheTtlSeconds: prepareResponse.cacheTtlSeconds,
    moduleSha256: prepareResponse.moduleSha256,
    moduleSizeBytes: prepareResponse.moduleSizeBytes,
  };
}
