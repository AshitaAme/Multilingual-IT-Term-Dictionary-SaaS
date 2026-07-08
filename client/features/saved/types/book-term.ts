import { ReviewCard } from './review-card';

export type BookTerm = {
  name: string;
  text: string;
  reviewCard?: ReviewCard | null;
};
