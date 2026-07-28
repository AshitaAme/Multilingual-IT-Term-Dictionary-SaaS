import { ReviewCard } from './review-card';

export interface BookTerm {
  name: string;
  text: string;
  savedTermId: string;
  reviewCard?: ReviewCard | null;
}
