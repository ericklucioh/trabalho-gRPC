import { NextResponse } from 'next/server';

import { API_VERSION } from '../../../lib/contracts';
import { listBrowserTools } from '../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  console.info('[frontend/api/tools] list request started');
  const tools = await listBrowserTools();
  console.info('[frontend/api/tools] list request completed', { toolCount: tools.length });

  return NextResponse.json({
    apiVersion: API_VERSION,
    tools,
  });
}
