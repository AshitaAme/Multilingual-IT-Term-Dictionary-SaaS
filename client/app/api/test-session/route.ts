// app/api/test-session/route.ts

import { auth } from '@/shared/lib/auth/auth';

export async function GET() {
  const session = await auth();
  return Response.json(session);
}
