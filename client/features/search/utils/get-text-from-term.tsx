import { SearchItem } from '../types/search-item';
import { getLanguage } from '@/shared/utils/utils';

export function getStringText(term: SearchItem) {
  return JSON.stringify(
    term.translations.map((t) => ({
      name: t.name,
      lang: getLanguage(t.languageCode),
      def: t.definition,
    })),
  );
}
