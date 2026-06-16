import { useCallback, useState } from 'react';

export function useSet<T>(initialValues?: T[]) {
  const [set, setSet] = useState<Set<T>>(new Set(initialValues));

  const add = useCallback((item: T) => {
    setSet((prev) => new Set(prev).add(item));
  }, []);

  const remove = useCallback((item: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const toggle = useCallback((item: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSet(new Set()), []);

  return { set, add, remove, toggle, clear };
}
