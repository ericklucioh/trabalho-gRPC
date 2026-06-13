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
import { MockToolRuntimeAdapter, type ToolRuntimeAdapter } from '../lib/tool-runtime';
import { validateInput } from '../lib/validation';
import { getToolCatalogMetadata } from '../lib/tool-metadata';

const defaultRuntimeAdapter = new MockToolRuntimeAdapter();

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
  requestId: string | null;
  requestStartedAtIso: string | null;
  requestDurationMs: number | null;
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
  const [statusMessage, setStatusMessage] = useState('Carregando catálogo de tools.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestStartedAtIso, setRequestStartedAtIso] = useState<string | null>(null);
  const [requestDurationMs, setRequestDurationMs] = useState<number | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadTools(): Promise<void> {
      setIsCatalogLoading(true);
      try {
        const fetchedTools = await catalogAdapter.listTools();
        if (!isActive) {
          return;
        }

        setTools(fetchedTools);
        setSelectedToolId((current) => current ?? fetchedTools[0]?.toolId ?? null);
        setStatusMessage('Catálogo carregado. Selecione uma tool para configurar.');
        setToolStatus('ready');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setToolStatus('failed');
        setErrorMessage(getErrorMessage(error));
        setStatusMessage('Falha ao carregar catálogo.');
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
    setSelectedToolId(toolId);
    setConfiguredTool(null);
    setOutputValue('');
    setErrorMessage(null);
    setInputError(null);
    setRequestId(null);
    setRequestStartedAtIso(null);
    setRequestDurationMs(null);
    setStatusMessage(`Tool selecionada: ${toolId}.`);
    setToolStatus('ready');
  }

  async function configureSelectedTool(): Promise<void> {
    if (!selectedToolId) {
      setErrorMessage('Selecione uma tool antes de configurar.');
      return;
    }

    setIsConfiguring(true);
    setErrorMessage(null);
    setStatusMessage('Solicitando pacote WASM via Next.');
    setToolStatus('loading');

    const clientRequestId = createRequestId();
    const prepareRequest = buildPrepareRequest(selectedToolId, clientRequestId);

    try {
      const prepareResponse = await catalogAdapter.prepareTool(prepareRequest);
      if (prepareResponse.status !== 'ready') {
        throw new Error(prepareResponse.statusMessage);
      }

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

      setConfiguredTool(loadedConfiguration);
      setToolStatus('configured');
      setStatusMessage('tool configurada');
      setInputError(null);
    } catch (error) {
      setToolStatus('failed');
      setErrorMessage(getErrorMessage(error));
      setStatusMessage('Falha ao configurar a tool.');
    } finally {
      setIsConfiguring(false);
    }
  }

  async function submitInput(): Promise<void> {
    if (!selectedToolId || !configuredTool) {
      setErrorMessage('Configure a tool antes de enviar o texto.');
      return;
    }

    const validation = validateInput(selectedToolId, inputValue);
    if (!validation.isValid) {
      setInputError(validation.errorMessage);
      setErrorMessage(null);
      return;
    }

    setIsSubmitting(true);
    setInputError(null);
    setErrorMessage(null);
    setOutputValue('');
    setRequestId(createRequestId());
    const startedAt = new Date();
    setRequestStartedAtIso(startedAt.toISOString());

    try {
      const result = await runtimeAdapter.execute(
        {
          toolId: selectedToolId,
          inputText: inputValue,
        },
        configuredTool,
      );
      setOutputValue(result.outputText);
      setStatusMessage('Conversão concluída localmente no browser.');
      setRequestDurationMs(Date.now() - startedAt.getTime());
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatusMessage('Falha ao processar a entrada.');
      setRequestDurationMs(Date.now() - startedAt.getTime());
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    tools,
    selectedToolId,
    selectedToolLabel: selectedTool?.displayName ?? 'Nenhuma tool selecionada',
    toolStatus,
    isCatalogLoading,
    isConfiguring,
    isSubmitting,
    isConfigured: configuredTool?.isConfigured ?? false,
    statusMessage,
    errorMessage,
    inputValue,
    outputValue,
    requestId,
    requestStartedAtIso,
    requestDurationMs,
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

  return 'Erro inesperado.';
}

function buildToolManifest(prepareResponse: Awaited<ReturnType<ToolCatalogAdapter['prepareTool']>>): ToolManifest {
  const metadata = getToolCatalogMetadata(prepareResponse.toolId);
  return {
    apiVersion: API_VERSION,
    toolId: prepareResponse.toolId,
    toolName: prepareResponse.displayName,
    moduleVersion: prepareResponse.moduleVersion,
    entrypoint: prepareResponse.entrypoint,
    inputKind: metadata.inputKind,
    outputKind: metadata.outputKind,
    supportedMimeTypes: prepareResponse.supportedMimeTypes,
    cacheTtlSeconds: 300,
    moduleSha256: prepareResponse.moduleSha256,
    moduleSizeBytes: prepareResponse.moduleSizeBytes,
  };
}
