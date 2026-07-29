import { db } from '@/shared/lib/db/db';
import { savedBookTerms } from '@/shared/lib/db/schemas/dictionary.schema';
import { MoveSave } from '../schemas/move-save.schema';
import { inArray } from 'drizzle-orm';
import { AppError } from '@/shared/errors/errors';

export async function moveSave(data: MoveSave) {
  const { ids, moveTo } = data;

  await db.transaction(async (tx) => {
    try {
      await tx
        .delete(savedBookTerms)
        .where(inArray(savedBookTerms.savedTermId, ids));
    } catch (err) {
      if (err instanceof Error) throw new AppError('Delete saved term failed');
    }

    const payload = ids.map((id) => ({ savedBookId: moveTo, savedTermId: id }));
    try {
      await tx.insert(savedBookTerms).values(payload);
    } catch (err) {
      if (err instanceof Error) throw new AppError('Insert saved term failed');
    }
  });
}
