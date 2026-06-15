import { NextResponse } from 'next/server';

import { API_VERSION } from '../../../lib/contracts';
import { listBrowserTools } from '../../../lib/backend-tool-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const tools = await listBrowserTools();
  return NextResponse.json({
    apiVersion: API_VERSION,
    tools,
  });
}
