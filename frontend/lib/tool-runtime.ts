import { type ToolConfiguration, type ToolExecutionRequest, type ToolExecutionResult } from './contracts';
import { formatJson, formatYaml } from './output-formatters';
import { validateInput } from './validation';

export interface ToolRuntimeAdapter {
  loadToolPackage(configuration: ToolConfiguration): Promise<ToolConfiguration>;
  execute(request: ToolExecutionRequest, configuration: ToolConfiguration): Promise<ToolExecutionResult>;
}

export class MockToolRuntimeAdapter implements ToolRuntimeAdapter {
  async loadToolPackage(configuration: ToolConfiguration): Promise<ToolConfiguration> {
    await delay(450);
    return {
      ...configuration,
      isConfigured: true,
    };
  }

  async execute(request: ToolExecutionRequest, configuration: ToolConfiguration): Promise<ToolExecutionResult> {
    const validation = validateInput(request.toolId, request.inputText);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage ?? 'Conteúdo inválido.');
    }

    await delay(180);

    const parsedValue = validation.parsedValue;

    if (request.toolId === 'json2yaml') {
      return {
        outputText: formatYaml(parsedValue),
        outputFormat: 'yaml',
      };
    }

    return {
      outputText: formatJson(parsedValue),
      outputFormat: 'json',
    };
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, milliseconds);
  });
}
