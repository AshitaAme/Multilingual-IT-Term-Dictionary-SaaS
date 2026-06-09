import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);

export const pgPool = new Pool({ connectionString: databaseUrl });
