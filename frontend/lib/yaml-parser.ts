type YamlScalar = string | number | boolean | null;

interface ParseState {
  lines: string[];
  index: number;
}

export function parseStructuredText(input: string): unknown {
  const state: ParseState = {
    lines: input.split(/\r?\n/),
    index: 0,
  };
  const value = parseBlock(state, 0);
  skipEmptyLines(state);

  if (state.index < state.lines.length) {
    throw new Error(`Unexpected content on line ${state.index + 1}.`);
  }

  return value;
}

function parseBlock(state: ParseState, indent: number): unknown {
  skipEmptyLines(state);
  if (state.index >= state.lines.length) {
    return {};
  }

  const currentIndent = getIndentLevel(state.lines[state.index]);
  if (currentIndent < indent) {
    return {};
  }

  if (trimmedLine(state.lines[state.index]).startsWith('- ')) {
    return parseSequence(state, indent);
  }

  return parseMapping(state, indent);
}

function parseSequence(state: ParseState, indent: number): unknown[] {
  const items: unknown[] = [];

  while (state.index < state.lines.length) {
    skipEmptyLines(state);
    if (state.index >= state.lines.length) {
      break;
    }

    const line = state.lines[state.index];
    const lineIndent = getIndentLevel(line);
    const trimmed = trimmedLine(line);

    if (lineIndent < indent || !trimmed.startsWith('- ')) {
      break;
    }

    const itemContent = trimmed.slice(2).trim();
    state.index += 1;

    if (itemContent.length > 0) {
      items.push(parseScalar(itemContent));
      continue;
    }

    items.push(parseNestedValue(state, indent + 2));
  }

  return items;
}

function parseMapping(state: ParseState, indent: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  while (state.index < state.lines.length) {
    skipEmptyLines(state);
    if (state.index >= state.lines.length) {
      break;
    }

    const line = state.lines[state.index];
    const lineIndent = getIndentLevel(line);
    if (lineIndent < indent) {
      break;
    }

    const trimmed = trimmedLine(line);
    if (trimmed.startsWith('- ')) {
      break;
    }

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex < 1) {
      throw new Error(`Invalid YAML line: "${trimmed}".`);
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const inlineValue = trimmed.slice(separatorIndex + 1).trim();
    state.index += 1;

    if (inlineValue.length > 0) {
      result[key] = parseScalar(inlineValue);
      continue;
    }

    result[key] = parseNestedValue(state, indent + 2);
  }

  return result;
}

function parseNestedValue(state: ParseState, indent: number): unknown {
  skipEmptyLines(state);
  if (state.index >= state.lines.length) {
    return {};
  }

  const lineIndent = getIndentLevel(state.lines[state.index]);
  if (lineIndent < indent) {
    return {};
  }

  return trimmedLine(state.lines[state.index]).startsWith('- ')
    ? parseSequence(state, indent)
    : parseMapping(state, indent);
}

function parseScalar(value: string): YamlScalar {
  if (/^".*"$/.test(value) || /^'.*'$/.test(value)) {
    return value.slice(1, -1);
  }

  if (value === 'null' || value === '~') {
    return null;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

function skipEmptyLines(state: ParseState): void {
  while (state.index < state.lines.length && trimmedLine(state.lines[state.index]).length === 0) {
    state.index += 1;
  }
}

function getIndentLevel(line: string): number {
  return line.length - line.trimStart().length;
}

function trimmedLine(line: string): string {
  return line.trim();
}
