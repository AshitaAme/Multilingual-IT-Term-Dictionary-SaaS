import { NextResponse } from 'next/server';
import { getSqlErrorCode } from '@/types/database';
import { registerSchema } from '@/lib/validations';
import { registerUser } from '@/services/auth/registerUser';

export async function POST(req: Request) {
  // 1. Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  // 2. Zod validation
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.errors.map((e) => e.message) },
      { status: 422 },
    );
  }

  const { name, email, password } = parsed.data;
  let tokenStr;
  // 3. Database operations
  try {
    const { verificationToken } = await registerUser(name, email, password);
    tokenStr = verificationToken;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 },
      );
    }

    const code = getSqlErrorCode(error);
    console.error(
      `[AUTH_REGISTER_POST] DB_CODE: ${code}`,
      error instanceof Error ? error.message : 'Unknown error',
    );

    // Another check for existent email, where the error is informed by database.
    // So that in case of high concurrency, eg. multiple request coming in with same email,
    // even if the requests pass through the service layer here,
    // from the data access layer, the system knows that only one of them succeeds eventually
    if (code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 },
      );
    }

    // Unknown server error
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }

  // 4. Send verification code to email

  // await send(verificationToken)
  return NextResponse.json({ success: true }, { status: 200 });
}
