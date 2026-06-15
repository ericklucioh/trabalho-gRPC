import { NextResponse, type NextRequest } from 'next/server';

import { API_VERSION } from '../../../../../lib/contracts';
import { prepareBrowserTool } from '../../../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ toolId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  const { toolId } = await context.params;

  try {
    await request.json();
  } catch (error) {
    return badRequest(toolId, error);
  }

  try {
    const response = await prepareBrowserTool({
      apiVersion: API_VERSION,
      toolId,
      clientRequestId: crypto.randomUUID(),
      preferClientWasm: true,
    });
    return NextResponse.json(response);
  } catch (error) {
    return upstreamError(toolId, error);
  }
}

function badRequest(toolId: string, error: unknown): Response {
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

function upstreamError(toolId: string, error: unknown): Response {
  return NextResponse.json(
    {
      apiVersion: API_VERSION,
      error: {
        code: getUpstreamErrorCode(error),
        message: getErrorMessage(error),
        offendingValue: toolId,
        expectedShape: 'reachable backend gRPC tool package',
      },
    },
    { status: getUpstreamStatus(error) },
  );
}

function getUpstreamErrorCode(error: unknown): string {
  if (error instanceof Error && error.message.includes('NOT_FOUND')) {
    return 'TOOL_NOT_FOUND';
  }

  return 'BACKEND_UNAVAILABLE';
}

function getUpstreamStatus(error: unknown): number {
  if (error instanceof Error && error.message.includes('NOT_FOUND')) {
    return 404;
  }

  return 502;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Invalid request body.';
}
