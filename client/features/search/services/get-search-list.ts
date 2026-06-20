import { db } from '@/shared/lib/db/db';
import {
  tagTranslations,
  terms,
  termTags,
  termTranslations,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { asc, eq, and, inArray } from 'drizzle-orm';
import { SearchItem } from '../types/search-item';
import { getOrInsert } from '@/shared/utils/utils';

export async function getSearchList(page: number, tagLanguageCode: string) {
  return await db.transaction(async (tx) => {
    // 1. Get paged term list
    const pagedTerms = await tx
      .select({ id: terms.id })
      .from(terms)
      .orderBy(asc(terms.slug))
      .limit(100)
      .offset((page - 1) * 100);
    const termIds = pagedTerms.map((t) => t.id);
    if (termIds.length === 0) return [];

    // 2. Get term and tag translations for each term id
    const fetchTermTranslations = tx
      .select({
        termId: termTranslations.termId,
        languageCode: termTranslations.languageCode,
        name: termTranslations.name,
        definition: termTranslations.definition,
      })
      .from(termTranslations)
      .where(inArray(termTranslations.termId, termIds));

    const fetchTagTranslations = tx
      .select({ termId: termTags.termId, name: tagTranslations.name })
      .from(tagTranslations)
      .leftJoin(termTags, eq(termTags.tagId, tagTranslations.tagId))
      .where(
        and(
          inArray(termTags.termId, termIds),
          eq(tagTranslations.languageCode, tagLanguageCode),
        ),
      );

    const [termTranslationList, tagTranslationList] = await Promise.all([
      fetchTermTranslations,
      fetchTagTranslations,
    ]);

    if (termTranslationList.length === 0) return [];

    // 3. Reform data into SearchItem type with map
    const searchItemMap = new Map<string, SearchItem>();
    termTranslationList.forEach((t) => {
      const { termId, languageCode, name, definition } = t;
      const searchItem = getOrInsert(searchItemMap, termId, {
        termId,
        translations: [],
        tags: [],
      });
      searchItem.translations.push({ languageCode, name, definition });
    });

    tagTranslationList.forEach((t) => {
      const { termId, name } = t;
      if (!termId) return;
      const searchItem = getOrInsert(searchItemMap, termId, {
        termId,
        translations: [],
        tags: [],
      });
      searchItem.tags.push(name);
    });

    // 4. Retrieve data from map by termId
    return termIds.map((termId) =>
      getOrInsert(searchItemMap, termId, {
        termId,
        translations: [],
        tags: [],
      }),
    );
  });
}
