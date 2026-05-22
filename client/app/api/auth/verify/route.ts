import { verifyRegister } from '@/services/auth/verify-register';
import { authMailVerifySchema } from '@/validations/auth-mail-verify-schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  // 2. Zod validation
  const parsed = authMailVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.errors.map((e) => e.message) },
      { status: 422 },
    );
  }

  const { email, verificationCode } = parsed.data;

  // 3. Verify
  try {
    await verifyRegister(email, verificationCode);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_OR_EXPIRED_CODE') {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 },
      );
    }

    console.error(
      '[AUTH_REGISTER_VERIFICATION_ERROR]',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
