import { cn } from '@/shared/utils/utils';
import { BookTerm } from '../types/book-term';
import { ReviewCard } from '../types/review-card';

export function ReviewProgress({
  term,
  className = '',
}: Readonly<{ term: BookTerm; className?: string }>) {
  const percentage = calculateLearningProgress(term.reviewCard!);
  // const percentage = 90;

  return (
    <div
      className={cn(
        'w-10 h-1.5 bg-foreground/10 rounded-full overflow-hidden shrink-0',
        className,
      )}
    >
      <div
        className="h-full bg-red-400 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function calculateLearningProgress(card: ReviewCard) {
  if (card.state === 'new' || !card.lastReviewAt) {
    return 0;
  }

  const TARGET_STABILITY = 21;

  const MIN_PROGRESS = 8;

  const progress = (card.stability / TARGET_STABILITY) * 100;

  return Math.min(Math.max(progress, MIN_PROGRESS), 100);
}
