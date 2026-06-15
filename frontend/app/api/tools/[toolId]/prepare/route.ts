import { NextResponse, type NextRequest } from 'next/server';

import { API_VERSION } from '../../../../../lib/contracts';
import { prepareBrowserTool } from '../../../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ toolId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  const { toolId } = await context.params;
  const clientRequestId = crypto.randomUUID();

  console.info('[frontend/api/tools/prepare] request started', {
    toolId,
    clientRequestId,
  });

  try {
    await request.json();
  } catch (error) {
    console.info('[frontend/api/tools/prepare] invalid request body', {
      toolId,
      clientRequestId,
    });
    return badRequest(toolId, error);
  }

  try {
    const response = await prepareBrowserTool({
      apiVersion: API_VERSION,
      toolId,
      clientRequestId,
      preferClientWasm: true,
    });
    console.info('[frontend/api/tools/prepare] request completed', {
      toolId,
      clientRequestId,
      status: response.status,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.info('[frontend/api/tools/prepare] upstream error', {
      toolId,
      clientRequestId,
    });
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
