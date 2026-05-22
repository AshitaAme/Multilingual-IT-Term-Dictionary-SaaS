import { NextResponse } from 'next/server';
import { getSqlErrorCode } from '@/types/database';
import { registerSchema } from '@/lib/validations';
import { registerUser } from '@/services/auth/registerUser';
import { registerVerificationEmail } from '@/services/mail/register-verification-email';

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

  // 3. Database operations
  let tokenStr;
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

    // Handle high-concurrency race conditions where multiple identical emails
    // pass the service layer but trigger a DB unique constraint violation (23505).
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

  try {
    await registerVerificationEmail(email, tokenStr);
  } catch (error: unknown) {
    console.error(
      '[AUTH_REGISTER_MAIL_ERROR]',
      error instanceof Error ? error.message : 'Email sending failed',
    );
    return NextResponse.json(
      { error: 'Email sending failed' },
      { status: 400 },
    );
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
