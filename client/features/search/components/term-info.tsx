'use client';

import { createPortal } from 'react-dom';
import { useOpenTermStore } from '../stores/search.store';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { X } from 'lucide-react';

export function TermInfo() {
  const openTerm = useOpenTermStore((state) => state.openTerm);
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const term = useOpenTermStore((state) => state.term);

  if (!openTerm || !term) return;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      <Card className="h-160 w-120 rounded-md bg-background py-0">
        <CardHeader>
          <X
            size={16}
            className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            onClick={() => setOpenTerm(false)}
          />
          <CardTitle className="">{term.displayName}</CardTitle>
        </CardHeader>

        {term.translations.map((t) => (
          <div key={t.languageCode}>
            <span>{t.name}</span>
            <span>{t.definition}</span>
          </div>
        ))}
      </Card>
    </div>,
    document.body,
  );
}
