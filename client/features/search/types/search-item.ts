export type SearchItem = {
  termId: string;
  displayName: string;
  translations: {
    languageCode: string;
    name: string;
    definition: string | null;
  }[];
  tags: string[];
};
