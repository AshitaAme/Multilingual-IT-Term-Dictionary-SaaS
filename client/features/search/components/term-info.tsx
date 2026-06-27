'use client';

import { Separator } from '@/shared/components/ui/separator';
import { createPortal } from 'react-dom';
import { useOpenTermStore } from '../stores/search.store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Star, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { checkSavedTermAction } from '../actions/check-saved-term.action';

export function TermInfo() {
  const openTerm = useOpenTermStore((state) => state.openTerm);
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const term = useOpenTermStore((state) => state.term);
  const [openSave, setOpenSave] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const check = async () => {
      const res = await checkSavedTermAction(term?.termId);
      if (res.success) setSaved(res.data!);
    };
    check();
  }, [term?.termId]);

  const language = (languageCode: string) => {
    switch (languageCode) {
      case 'cn':
        return '中文';
      case 'ja':
        return '日本語';
      default:
        return 'English';
    }
  };

  const handleStarClick = () => {
    saveTermAction(term?.termId);
  };

  if (!openTerm || !term) return;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      <Card className="h-140 w-120 overflow-y-auto rounded-md bg-background py-0 relative gap-8">
        <CardHeader className="pt-3 pl-4 flex flex-row items-baseline gap-1">
          <X
            size={16}
            className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            onClick={() => setOpenTerm(false)}
          />
          <CardTitle className="text-2xl">{term.displayName}</CardTitle>
          <Button
            variant="ghost"
            className="cursor-pointer"
            size="icon"
            onClick={handleStarClick}
          >
            <Star
              size={16}
              className={
                saved ? 'fill-yellow-400 text-yellow-400 transition-colors' : ''
              }
            />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {term.translations.map((t) => (
            <div key={t.languageCode} className="flex flex-col gap-2">
              <span className="flex gap-2">
                <span>{t.name}</span>
                <span>{language(t.languageCode)}</span>
              </span>
              <Separator />
              <p>{t.definition}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
