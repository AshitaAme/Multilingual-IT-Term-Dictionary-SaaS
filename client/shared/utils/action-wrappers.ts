import { getTranslations } from 'next-intl/server';
import { auth } from '../lib/auth/auth';
import { Session } from 'next-auth';

export type ServerTranslator =
  | Awaited<ReturnType<typeof getTranslations>>
  | undefined;

export function withTranslations<TInput extends unknown[], TOutput>(
  namespace: string,
  action: (t: ServerTranslator, ...args: TInput) => Promise<TOutput>,
) {
  return async (...args: TInput): Promise<TOutput> => {
    let t: ServerTranslator;

    try {
      t = await getTranslations(namespace);
    } catch (err) {
      console.warn(
        `[withTranslations] Fetch translator failed for namespace "${namespace}":`,
        err,
      );
    }

    return action(t, ...args);
  };
}

export function withAuth<TInput extends unknown[], TOutput>(
  action: (session: Session | null, ...args: TInput) => Promise<TOutput>,
) {
  return async (...args: TInput): Promise<TOutput> => {
    let session: Session | null = null;
    try {
      session = await auth();
    } catch (err) {
      console.warn('[withAuth] Fetch session failed', err);
    }
    return action(session, ...args);
  };
}

export function withAuthAndTranslations<TInput extends unknown[], TOutput>(
  namespace: string,
  action: (
    session: Session | null,
    t: ServerTranslator,
    ...args: TInput
  ) => Promise<TOutput>,
) {
  return async (...args: TInput): Promise<TOutput> => {
    let session: Session | null = null;
    let t: ServerTranslator;
    try {
      session = await auth();
    } catch (err) {
      console.warn('[withAuthAndTranslator] Fetch session failed', err);
    }

    try {
      t = await getTranslations(namespace);
    } catch (err) {
      console.warn(
        `[withTranslations] Fetch translator failed for namespace "${namespace}":`,
        err,
      );
    }
    return action(session, t, ...args);
  };
}
