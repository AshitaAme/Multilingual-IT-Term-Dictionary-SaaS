import { fsrs, Grade, State, type Card } from 'ts-fsrs';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/lib/db/db';
import { reviewCards } from '@/shared/lib/db/schemas/dictionary.schema';

const scheduler = fsrs({
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['10m'],
});

function toFsrsState(state: string): State {
  const map: Record<string, State> = {
    new: State.New,
    learning: State.Learning,
    review: State.Review,
    relearning: State.Relearning,
  };
  return map[state] ?? State.New;
}

function fromFsrsState(state: State): string {
  const map: Record<State, string> = {
    [State.New]: 'new',
    [State.Learning]: 'learning',
    [State.Review]: 'review',
    [State.Relearning]: 'relearning',
  };
  return map[state];
}

export async function updateReview(savedTermId: string, rating: Grade) {
  // 1. Get current review card
  const [current] = await db
    .select()
    .from(reviewCards)
    .where(eq(reviewCards.savedTermId, savedTermId));

  if (!current) {
    throw new Error(`Review card not found for savedTermId: ${savedTermId}`);
  }

  // 2. Create a card to be updated
  const now = new Date();
  const card: Card = {
    due: current.nextReviewAt,
    stability: Math.max(current.stability, 0.1),
    difficulty: current.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    learning_steps: current.step,
    state: toFsrsState(current.state),
    last_review: current.lastReviewAt ?? undefined,
  };

  const { card: updated } = scheduler.next(card, now, rating);

  // 3. Insert updated card
  await db
    .update(reviewCards)
    .set({
      stability: updated.stability,
      difficulty: updated.difficulty,
      state: fromFsrsState(updated.state),
      step: updated.learning_steps,
      nextReviewAt: updated.due,
      lastReviewAt: now,
    })
    .where(eq(reviewCards.savedTermId, savedTermId));

  return updated;
}
