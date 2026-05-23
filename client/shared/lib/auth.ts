import NextAuth from 'next-auth';

import { authConfig } from './auth.config';
import { db } from './db/db';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  ...authConfig,
});
