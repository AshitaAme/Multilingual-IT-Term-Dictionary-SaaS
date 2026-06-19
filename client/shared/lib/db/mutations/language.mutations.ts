import { db } from '../db';
import { languages } from '../schemas/dictionary.schema';

export async function upsertLanguage(values: {
  code: string;
  name: string;
  isDefault?: boolean;
}) {
  const [result] = await db
    .insert(languages)
    .values(values)
    .onConflictDoUpdate({
      target: languages.code,
      set: {
        name: values.name,
        isDefault: values.isDefault,
      },
    })
    .returning();

  return result;
}
