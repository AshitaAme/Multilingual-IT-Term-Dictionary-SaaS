import { ReviewCard } from './review-card';

export interface BookTerm {
  name: string;
  text: string;
  termId: string;
  reviewCard?: ReviewCard | null;
}
