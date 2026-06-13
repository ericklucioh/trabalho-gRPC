import { NextResponse } from 'next/server';

import { API_VERSION, type ToolId } from '../../../../../lib/contracts';
import { readBrowserToolPackage } from '../../../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';

interface RouteContext {
  params: { toolId: string };
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const toolId = context.params.toolId;
  if (!isToolId(toolId)) {
    return NextResponse.json(
      {
        apiVersion: API_VERSION,
        error: {
          code: 'NOT_FOUND',
          message: `Unknown tool_id ${toolId}.`,
          offendingValue: toolId,
          expectedShape: 'json2yaml | yaml2json',
        },
      },
      { status: 404 },
    );
  }

  const bytes = await readBrowserToolPackage(toolId);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/wasm',
      'Content-Length': String(bytes.byteLength),
    },
  });
}

function isToolId(value: string): value is ToolId {
  return value === 'json2yaml' || value === 'yaml2json';
}
