import { type ParsedContentKind, type ToolExecutionRequest, type ToolId, type TypedError } from './contracts';
import { parseStructuredText } from './yaml-parser';

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  parsedKind: ParsedContentKind | null;
  parsedValue: unknown | null;
}

export function validateInput(toolId: ToolId, inputText: string): ValidationResult {
  const trimmedInput = inputText.trim();
  if (trimmedInput.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Digite um texto antes de enviar.',
      parsedKind: null,
      parsedValue: null,
    };
  }

  try {
    if (toolId === 'json2yaml') {
      return buildResult(JSON.parse(trimmedInput), 'json');
    }

    return buildResult(parseStructuredText(trimmedInput), 'yaml');
  } catch (error) {
    return {
      isValid: false,
      errorMessage: buildValidationMessage(toolId, trimmedInput, error),
      parsedKind: null,
      parsedValue: null,
    };
  }
}

function buildResult(parsedValue: unknown, parsedKind: ParsedContentKind): ValidationResult {
  return {
    isValid: true,
    errorMessage: null,
    parsedKind,
    parsedValue,
  };
}

function buildValidationMessage(toolId: ToolId, offendingValue: string, error: unknown): string {
  const baseMessage = error instanceof Error ? error.message : 'Conteúdo inválido.';
  const expectedShape = toolId === 'json2yaml' ? 'JSON válido' : 'YAML válido';
  return `${baseMessage} Valor recebido: ${offendingValue}. Esperado: ${expectedShape}.`;
}

export function buildExecutionError(code: string, message: string, offendingValue: string, expectedShape: string): TypedError {
  return {
    code,
    message,
    offendingValue,
    expectedShape,
  };
}

export function buildExecutionRequest(toolId: ToolId, inputText: string): ToolExecutionRequest {
  return {
    toolId,
    inputText,
  };
}
