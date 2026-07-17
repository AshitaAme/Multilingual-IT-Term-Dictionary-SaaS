import { renderToString } from 'react-dom/server';
import { SearchItem } from '../types/search-item';
import { getLanguage } from '@/shared/utils/utils';

export function getTextFromTerm(term: SearchItem) {
  return renderToString(
    term?.translations.map((t) => (
      <div key={t.languageCode} className="flex flex-col gap-2">
        <span className="flex gap-2">
          <span>{t.name}</span>
          <span>{getLanguage(t.languageCode)}</span>
        </span>
        <hr className="my-2 border-gray-200" />
        <p>{t.definition}</p>
      </div>
    )),
  );
}
