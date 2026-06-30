import { db } from '@/shared/lib/db/db';
import { tagTranslations } from '@/shared/lib/db/schemas/dictionary.schema';
import { ilike } from 'drizzle-orm';

export async function getTatList(query: string) {
  const res = await db
    .select()
    .from(tagTranslations)
    .where(ilike(tagTranslations.name, query));
  return res;
}
