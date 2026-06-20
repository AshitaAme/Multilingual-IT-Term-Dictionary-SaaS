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

export function getLanguageCode(locale: string) {
  return LANGUAGE_CODES.find((t) => locale.startsWith(t)) || 'en';
}
