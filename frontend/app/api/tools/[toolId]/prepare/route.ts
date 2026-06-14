import { NextResponse, type NextRequest } from 'next/server';

import { API_VERSION } from '../../../../../lib/contracts';
import { prepareBrowserTool } from '../../../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';

interface RouteContext {
  params: { toolId: string };
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  const toolId = context.params.toolId;
  try {
    await request.json();
    const response = await prepareBrowserTool({
      apiVersion: API_VERSION,
      toolId,
      clientRequestId: crypto.randomUUID(),
      preferClientWasm: true,
    });
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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid request body.';
}
