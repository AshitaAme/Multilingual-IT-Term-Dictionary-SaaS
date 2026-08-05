import { getTranslations } from 'next-intl/server';

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
        `Fetch translator failed for namespace "${namespace}":`,
        err,
      );
    }

    return action(t, ...args);
  };
}
