import NextAuth, { AuthError } from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { users } from './db/schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  debug: true,
  providers: [
    GitHubProvider,
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .then((res) => res[0]);

          if (!user?.password) {
            throw new AuthError('Invalid credentials');
          }
         
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );
          if (!isValid) {
            throw new AuthError('Wrong password');
          }
          return user;
        } catch (error) {
          if (error instanceof AuthError) {
            throw error;
          }

          console.error('Unexpected error during authorization:', error);
          throw new AuthError('Server error. Please try later.');
        }
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
