import { db } from '@/shared/lib/db/db';
import { savedTerms } from '@/shared/lib/db/schemas/dictionary.schema';
import { eq } from 'drizzle-orm';

export async function updateTermText(savedTermId: string, text: string) {
  const [result] = await db
    .update(savedTerms)
    .set({ text })
    .where(eq(savedTerms.id, savedTermId))
    .returning();
  return result;
}
