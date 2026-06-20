export type SearchItem = {
  termId: string;
  translations: {
    languageCode: string;
    name: string;
    definition: string | null;
  }[];
  tags: string[];
};
