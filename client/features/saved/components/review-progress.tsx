import { cn } from '@/shared/utils/utils';
import { BookTerm } from '../types/book-term';
import { ReviewCard } from '../types/review-card';

export function ReviewProgress({
  term,
  className = '',
}: Readonly<{ term: BookTerm; className?: string }>) {
  const percentage = calculateRetention(term.reviewCard!);
  //   const percentage = 90;

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

export function calculateRetention(card: ReviewCard) {
  if (card.state === 'new' || !card.lastReviewAt) {
    return 0;
  }

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsedDays = (now.getTime() - card.lastReviewAt.getTime()) / msPerDay;

  if (card.stability <= 0) return 0;

  const retention = Math.pow(0.9, elapsedDays / card.stability);

  return Math.min(Math.max(retention * 100, 0), 100);
}
