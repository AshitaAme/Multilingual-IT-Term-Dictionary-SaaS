'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { getSqlErrorCode } from '@/app/types/database';
import { registerSchema } from '@/lib/validations';

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

  // 3. Check for whether the email(a user) existed
  try {
    const isExistent = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0]);

    if (isExistent) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 },
      );
    }

    // 4. Insert new user with hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({ name, email, password: hashedPassword });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const code = getSqlErrorCode(error);
    console.error(
      `[AUTH_REGISTER_POST] DB_CODE: ${code}`,
      error instanceof Error ? error.message : 'Unknown error',
    );

    // Another check for existent email, which is informed by database,
    // so that in case of high concurrency, eg. multiple request coming in with same email,
    // the system will know that only one of them succeeds in the end.
    if (code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
