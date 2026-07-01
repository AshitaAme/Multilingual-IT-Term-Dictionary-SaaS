import { db } from '@/shared/lib/db/db';
import { tagTranslations } from '@/shared/lib/db/schemas/dictionary.schema';
import { ilike } from 'drizzle-orm';

export async function getTagList(query: string) {
  const searchCondition =
    query.length > 0 ? ilike(tagTranslations.name, query) : undefined;

  const res = await db.select().from(tagTranslations).where(searchCondition);

  return res.map((t) => t.name);
}
