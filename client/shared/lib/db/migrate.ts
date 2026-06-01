// shared/lib/db/migrate.ts
import dotenv from 'dotenv'; //
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';

dotenv.config({ path: './.env' });
const sql = neon(process.env.MIGRATE_DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  try {
    await migrate(db, { migrationsFolder: './shared/lib/db/migrations' });
    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main();
