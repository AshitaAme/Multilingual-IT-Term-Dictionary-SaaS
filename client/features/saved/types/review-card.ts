export type ReviewCard = {
  stability: number;
  difficulty: number;
  state: string;
  step: number;
  nextReviewAt: Date;
  lastReviewAt: Date | null;
};
