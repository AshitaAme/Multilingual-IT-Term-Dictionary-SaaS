import { fsrs, State, type Card, type Grade } from 'ts-fsrs';
import { eq, and } from 'drizzle-orm';
import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  reviewLogs,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';

const scheduler = fsrs();

const STATE_FROM_DB: Record<string, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const STATE_TO_DB: Record<State, string> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

export async function review(userId: string, termId: string, rating: Grade) {
  return await db.transaction(async (tx) => {
    await tx.insert(savedTerms).values({ userId, termId });

    const [card] = await tx
      .select()
      .from(reviewCards)
      .where(
        and(eq(reviewCards.userId, userId), eq(reviewCards.termId, termId)),
      );

    if (!card) throw new Error('Review card not found');

    const input: Card = {
      due: card.nextReviewAt,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: STATE_FROM_DB[card.state] ?? State.New,
      last_review: card.lastReviewAt ?? undefined,
      learning_steps: card.step,
    };

    const { card: updated } = scheduler.next(input, new Date(), rating);

    await tx
      .update(reviewCards)
      .set({
        stability: updated.stability,
        difficulty: updated.difficulty,
        state: STATE_TO_DB[updated.state],
        step: updated.learning_steps,
        nextReviewAt: updated.due,
        lastReviewAt: new Date(),
      })
      .where(eq(reviewCards.id, card.id));

    await tx.insert(reviewLogs).values({
      userId,
      termId,
      reviewCardId: card.id,
      rating,
      stabilityAfter: updated.stability,
      difficultyAfter: updated.difficulty,
    });
  });
}
