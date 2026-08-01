import { addReview } from '@/shared/lib/db/mutations/review-card.mutations';

export interface ReviewCard {
  stability: number;
  difficulty: number;
  state: string;
  step: number;
  nextReviewAt: Date;
  lastReviewAt: Date | null;
}

export const toReviewCard = (
  card: Awaited<ReturnType<typeof addReview>>[number],
): ReviewCard => {
  const { stability, difficulty, state, step, nextReviewAt, lastReviewAt } =
    card;
  return { stability, difficulty, state, step, nextReviewAt, lastReviewAt };
};
