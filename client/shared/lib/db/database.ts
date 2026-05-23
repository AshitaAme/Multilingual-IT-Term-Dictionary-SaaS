export interface PostgresError {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

export function getSqlErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;

  // Cast to a generic object to safely check properties
  const err = error as Record<string, unknown>;

  // 1. Check top-level 'code' (Standard pg/postgres.js)
  if (typeof err.code === 'string') return err.code;

  // 2. Check nested 'cause.code' (Common in Neon HTTP driver)
  const cause = err.cause as Record<string, unknown> | undefined;
  if (cause && typeof cause.code === 'string') return cause.code;

  return undefined;
}
