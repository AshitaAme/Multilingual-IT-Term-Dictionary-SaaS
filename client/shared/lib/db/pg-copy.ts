import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import copyFrom from 'pg-copy-streams';
import { stringify } from 'csv-stringify';
import type { Pool, PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
export interface CopyOptions<T> {
  pool: Pool;
  table: string;
  columns: (keyof T & string)[];
  rows: T[];
}
export interface UpsertOptions<T> extends CopyOptions<T> {
  conflictColumns: (keyof T & string)[];
  updateColumns: (keyof T & string)[];
}

export async function copyInsert<T extends object>(
  opts: CopyOptions<T>,
): Promise<void> {
  const { pool, table, columns, rows } = opts;
  if (!rows.length) return;

  await withTransaction(pool, (client) =>
    streamCopy(client, table, columns, rows),
  );
}

export async function copyUpsert<T extends object>(
  opts: UpsertOptions<T>,
): Promise<void> {
  const { pool, table, columns, rows, conflictColumns, updateColumns } = opts;
  if (!rows.length) return;

  const tmp = `_tmp_${table}_${randomUUID().replaceAll('-', '')}`;

  await withTransaction(pool, async (client) => {
    await client.query(
      `CREATE TEMP TABLE "${tmp}" (LIKE "${table}" INCLUDING ALL) ON COMMIT DROP`,
    );

    await streamCopy(client, tmp, columns, rows);

    const cols = columns.map((c) => `"${c}"`).join(', ');
    const conflict = conflictColumns.map((c) => `"${c}"`).join(', ');
    const updateSet = updateColumns
      .map((c) => `"${c}" = EXCLUDED."${c}"`)
      .join(', ');

    await client.query(`
      INSERT INTO "${table}" (${cols})
      SELECT ${cols} FROM "${tmp}"
      ON CONFLICT (${conflict}) DO UPDATE SET ${updateSet}
    `);
  });
}

function rowsToCSVStream<T>(
  rows: T[],
  columns: (keyof T & string)[],
): Readable {
  const csv = stringify({ header: true, columns });
  for (const row of rows) csv.write(row);
  csv.end();
  return csv;
}

async function streamCopy<T>(
  client: PoolClient,
  table: string,
  columns: (keyof T & string)[],
  rows: T[],
): Promise<void> {
  const cols = columns.map((c) => `"${c}"`).join(', ');
  const sql = `COPY "${table}" (${cols}) FROM STDIN CSV HEADER`;
  await pipeline(
    rowsToCSVStream(rows, columns),
    client.query(copyFrom.from(sql)),
  );
}

async function withTransaction<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
