import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrInsert<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
  const existing = map.get(key);
  if (existing !== undefined) return existing;
  map.set(key, defaultValue);
  return defaultValue;
}
