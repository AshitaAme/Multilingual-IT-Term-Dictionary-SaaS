import { db } from '@/shared/lib/db/db';
import {
  tags,
  tagTranslations,
  terms,
  termTags,
  termTranslations,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { asc, eq, and, inArray, ilike, or, exists, sql } from 'drizzle-orm';
import { mapGetOrInsert } from '@/shared/utils/utils';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';
import { TermFormInput } from '../schemas/term-form.schema';

export async function getTermList(page: number, query: string) {
  // 1. Build search condition on query params
  // 1.1 Filter invalid param
  const queryParams = [
    ...new Set(
      query
        .split(' ')
        .map((q) => q.trim())
        .filter((q) => q.length > 0),
    ),
  ];

  // 1.2 For each param, check whether there is a term or a tag that is like it
  const searchCondition =
    queryParams.length === 0
      ? undefined
      : and(
          ...queryParams.map((q) =>
            or(
              exists(
                // Term check
                db
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
                // Tag check
                db
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
  const pagedTerms = await db
    .select({ id: terms.id, slug: terms.slug, status: terms.status })
    .from(terms)
    .where(searchCondition)
    .orderBy(asc(terms.slug))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const termMap = new Map<string, [string, 'draft' | 'published']>();
  const termIds = pagedTerms.map((t) => {
    termMap.set(t.id, [t.slug, t.status]);
    return t.id;
  });

  if (termIds.length === 0) return [];

  // 3. Get term and tag translations for each term id
  const fetchTermTranslations = db
    .select({
      termId: termTranslations.termId,
      languageCode: termTranslations.languageCode,
      name: termTranslations.name,
      definition: termTranslations.definition,
    })
    .from(termTranslations)
    .where(inArray(termTranslations.termId, termIds));

  const fetchTagTranslations = db
    .select({
      termId: termTags.termId,
      tagId: termTags.tagId,
      name: tagTranslations.name,
      color: tags.color,
    })
    .from(tagTranslations)
    .leftJoin(termTags, eq(termTags.tagId, tagTranslations.tagId))
    .leftJoin(tags, eq(tags.id, tagTranslations.tagId))
    .where(inArray(termTags.termId, termIds));

  const [termTranslationList, tagTranslationList] = await Promise.all([
    fetchTermTranslations,
    fetchTagTranslations,
  ]);

  if (termTranslationList.length === 0) return [];

  // 4. Reform data into SearchItem type with map
  const searchItemMap = new Map<string, TermFormInput>();
  termTranslationList.forEach((t) => {
    const { termId, languageCode, name, definition } = t;
    const [slug, status] = termMap.get(termId)!;
    const searchItem = mapGetOrInsert(searchItemMap, termId, {
      slug,
      status,
      langInfoList: [],
      tagInfoList: [],
    });
    searchItem.langInfoList.push({
      languageCode,
      name,
      definition: definition || '',
    });
    // Pick display name for the language user is using
  });

  tagTranslationList.forEach((t) => {
    const { termId, name, tagId } = t;
    if (!termId || !tagId) return;
    const [slug, status] = termMap.get(termId)!;
    const searchItem = mapGetOrInsert(searchItemMap, termId, {
      slug,
      status,
      langInfoList: [],
      tagInfoList: [],
    });
    searchItem.tagInfoList.push({ name, tagId });
  });

  // 5. Retrieve data from map by termId
  return pagedTerms.map((t) => {
    const [slug, status] = termMap.get(t.id)!;
    const entries = mapGetOrInsert(searchItemMap, t.id, {
      slug,
      status,
      langInfoList: [],
      tagInfoList: [],
    });
    return entries;
  });
}
