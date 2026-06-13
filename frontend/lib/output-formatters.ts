export function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function formatYaml(value: unknown): string {
  return `${serializeYaml(value, 0)}\n`;
}

function serializeYaml(value: unknown, indent: number): string {
  const padding = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${padding}[]`;
    }

    return value
      .map((item) => {
        if (isScalar(item)) {
          return `${padding}- ${serializeScalar(item)}`;
        }

        const nested = serializeYaml(item, indent + 2);
        return `${padding}-\n${nested}`;
      })
      .join('\n');
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return `${padding}{}`;
    }

    return entries
      .map(([key, item]) => {
        if (isScalar(item)) {
          return `${padding}${key}: ${serializeScalar(item)}`;
        }

        return `${padding}${key}:\n${serializeYaml(item, indent + 2)}`;
      })
      .join('\n');
  }

  return `${padding}${serializeScalar(value)}`;
}

function serializeScalar(value: unknown): string {
  if (typeof value === 'string') {
    return needsQuotes(value) ? JSON.stringify(value) : value;
  }

  if (value === null) {
    return 'null';
  }

  return String(value);
}

function needsQuotes(value: string): boolean {
  return value.length === 0 || /[:#\n\r\t\-{}[\],&*!?|>'"%@`]/.test(value) || /^\s|\s$/.test(value);
}

function isScalar(value: unknown): value is string | number | boolean | null {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
