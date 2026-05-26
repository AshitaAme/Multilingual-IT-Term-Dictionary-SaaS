import { AuthError } from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/shared/lib/db/db';
import { eq } from 'drizzle-orm';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { users } from './db/schema';
import type { NextAuthConfig } from 'next-auth';
import Twitter from 'next-auth/providers/twitter';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  debug: true,
  pages: {
    error: '/',
  },
  providers: [
    GitHub,
    Google,
    Twitter,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          // 1. use email to find the specific user
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .then((res) => res[0]);

          // 2. check the existence of the user and their password
          if (!user?.password) {
            throw new AuthError('Invalid credentials');
          }

          // 3. check the validation of the password with bcrypt
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );
          if (!isValid) {
            throw new AuthError('Wrong password');
          }

          // 4. return user information
          return user;
        } catch (error) {
          // if of AuthError, the error occurred in try bracket and got handled there,
          // so just throw it
          if (error instanceof AuthError) {
            throw error;
          }

          // if not of AuthError, the error is unknown error
          // so handle it before throwing
          console.error('Unexpected error during authorization:', error);
          throw new AuthError('Server error. Please try later.');
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.image = token.image as string;
      session.user.email = token.email as string;
      return session;
    },
  },
};
