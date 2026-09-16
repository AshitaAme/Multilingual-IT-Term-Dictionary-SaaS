import { ReviewCard } from './review-card';

export interface BookTerm {
  savedTermId: string;
  name: string;
  text: string;
  reviewCard: ReviewCard | null;
}
