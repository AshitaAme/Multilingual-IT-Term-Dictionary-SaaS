import { db } from '@/shared/lib/db/db';
import {
  tags,
  tagTranslations,
  terms,
  termTags,
  termTranslations,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { asc, eq, and, inArray, ilike, or, exists, sql } from 'drizzle-orm';
import { SearchItem } from '../types/search-item';
import { mapGetOrInsert } from '@/shared/utils/utils';

export async function getSearchList(
  page: number,
  userLang: string,
  query: string,
) {
  return await db.transaction(async (tx) => {
    // 1. Build search condition on query params
    const queryParams = [
      ...new Set(
        query
          .split(' ')
          .map((q) => q.trim())
          .filter((q) => q.length > 0),
      ),
    ];

    const searchCondition =
      queryParams.length === 0
        ? undefined
        : and(
            ...queryParams.map((q) =>
              or(
                exists(
                  tx
                    .select({ one: sql`1` })
                    .from(termTranslations)
                    .where(
                      and(
                        eq(termTranslations.termId, terms.id),
                        ilike(termTranslations.name, `%${q}%`),
                      ),
                    ),
                ),
                exists(
                  tx
                    .select({ one: sql`1` })
                    .from(termTags)
                    .innerJoin(
                      tagTranslations,
                      eq(tagTranslations.tagId, termTags.tagId),
                    )
                    .where(
                      and(
                        eq(termTags.termId, terms.id),
                        ilike(tagTranslations.name, `%${q}%`),
                      ),
                    ),
                ),
              ),
            ),
          );

    // 2. Get paged terms
    const pagedTerms = await tx
      .select({ id: terms.id })
      .from(terms)
      .where(searchCondition)
      .orderBy(asc(terms.slug))
      .limit(100)
      .offset((page - 1) * 100);

    const termIds = pagedTerms.map((t) => t.id);
    if (termIds.length === 0) return [];

    // 3. Get term and tag translations for each term id
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
      .select({
        termId: termTags.termId,
        name: tagTranslations.name,
        color: tags.color,
      })
      .from(tagTranslations)
      .leftJoin(termTags, eq(termTags.tagId, tagTranslations.tagId))
      .leftJoin(tags, eq(tags.id, tagTranslations.tagId))
      .where(
        and(
          inArray(termTags.termId, termIds),
          eq(tagTranslations.languageCode, userLang),
        ),
      );

    const [termTranslationList, tagTranslationList] = await Promise.all([
      fetchTermTranslations,
      fetchTagTranslations,
    ]);

    if (termTranslationList.length === 0) return [];

    // 4. Reform data into SearchItem type with map
    const searchItemMap = new Map<string, SearchItem>();
    termTranslationList.forEach((t) => {
      const { termId, languageCode, name, definition } = t;
      const searchItem = mapGetOrInsert(searchItemMap, termId, {
        termId,
        displayName: 'N',
        translations: [],
        tags: [],
      });
      searchItem.translations.push({ languageCode, name, definition });
      if (languageCode === userLang) searchItem.displayName = name;
    });

    tagTranslationList.forEach((t) => {
      const { termId, name, color } = t;
      if (!termId) return;
      const searchItem = mapGetOrInsert(searchItemMap, termId, {
        termId,
        displayName: 'N',
        translations: [],
        tags: [],
      });
      searchItem.tags.push({ name, color: color! });
    });

    // 5. Retrieve data from map by termId
    return termIds.map((termId) =>
      mapGetOrInsert(searchItemMap, termId, {
        termId,
        displayName: 'N',
        translations: [],
        tags: [],
      }),
    );
  });
}
