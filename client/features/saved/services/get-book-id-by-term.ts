import { db } from '@/shared/lib/db/db';
import { savedBookTerms } from '@/shared/lib/db/schemas/dictionary.schema';
import { inArray } from 'drizzle-orm';

export async function getBookIdByTerm(termIds: string[]) {
  const result = await db
    .select({ bookId: savedBookTerms.savedBookId })
    .from(savedBookTerms)
    .where(inArray(savedBookTerms.savedTermId, termIds));
  return result;
}
