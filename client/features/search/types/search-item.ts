export type SearchItem = {
  termId: string;
  displayName: string; // The term name according to the language that user is using
  saved: boolean;
  translations: {
    languageCode: string;
    name: string;
    definition: string | null;
  }[];
  tags: {
    name: string;
    color: string;
  }[];
};
