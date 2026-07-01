import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LANGUAGE_CODES } from '../constants/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapGetOrInsert<K, V>(
  map: Map<K, V>,
  key: K,
  defaultValue: V,
): V {
  const existing = map.get(key);
  if (existing !== undefined) return existing;
  map.set(key, defaultValue);
  return defaultValue;
}

export function getLanguageCode(locale: string | undefined) {
  if (!locale) return 'en';
  return LANGUAGE_CODES.find((t) => locale.startsWith(t)) || 'en';
}

export function isFormedBy(str: string, element: string) {
  if (!str || !element) return false;
  if (str.length === 0 || element.length === 0) return false;
  if (element.length > str.length) return false;
  let a = 0;
  for (const e of str) {
    if (e === element.charAt(a)) a++;
  }
  return a === element.length;
}
