import { NextResponse, type NextRequest } from 'next/server';

import { API_VERSION, type PrepareToolRequest, type ToolId } from '../../../../../lib/contracts';
import { prepareBrowserTool } from '../../../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';

interface RouteContext {
  params: { toolId: string };
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
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

  try {
    const body = await request.json();
    const preparedRequest = validateRequest(body, toolId);
    const response = await prepareBrowserTool(preparedRequest);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        apiVersion: API_VERSION,
        error: {
          code: 'BAD_REQUEST',
          message: getErrorMessage(error),
          offendingValue: toolId,
          expectedShape: 'PrepareToolRequest JSON body',
        },
      },
      { status: 400 },
    );
  }
}

function validateRequest(body: unknown, toolId: ToolId): PrepareToolRequest {
  if (!isObject(body)) {
    throw new Error('Expected JSON request body.');
  }

  const apiVersion = readString(body.apiVersion, 'apiVersion');
  if (apiVersion !== API_VERSION) {
    throw new Error(`Expected apiVersion ${API_VERSION}, received ${apiVersion}.`);
  }

  return {
    apiVersion: API_VERSION,
    toolId,
    clientRequestId: readString(body.clientRequestId, 'clientRequestId'),
    preferClientWasm: true,
  };
}

function readString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Expected non-empty string for ${fieldName}.`);
  }

  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isToolId(value: string): value is ToolId {
  return value === 'json2yaml' || value === 'yaml2json';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid request body.';
}
