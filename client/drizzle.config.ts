import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './shared/lib/db/schema.ts',
  out: './shared/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
