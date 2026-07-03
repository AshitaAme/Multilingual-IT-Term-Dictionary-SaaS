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
import { useEffect, useState } from 'react';
import { checkSavedTermAction } from '../actions/check-saved-term.action';
import { saveTermAction } from '../actions/save-term.action';
import { toast } from 'sonner';
import { unsaveTermAction } from '../actions/unsave-term.action';
import { useSession } from 'next-auth/react';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { useTranslations } from 'next-intl';

export function TermInfo() {
  const t = useTranslations('search');
  const openTerm = useOpenTermStore((state) => state.openTerm);
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const term = useOpenTermStore((state) => state.term);
  const unActivate = !openTerm || !term;
  const termId = term?.termId;
  const [saved, setSaved] = useState(false);
  const session = useSession();
  const userId = session.data?.user.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkSave = async () => {
      setIsLoading(true);
      if (unActivate) return;
      if (!userId) {
        toast.error('User not found');
        return;
      }
      if (!termId) {
        toast.error('Term not found');
        return;
      }
      const res = await checkSavedTermAction({ userId, termId });
      if (res.success) setSaved(res.data!);
      else toast.error(res.error);
      setIsLoading(false);
    };
    checkSave();
  }, [unActivate, termId, userId]);

  const language = (languageCode: string) => {
    switch (languageCode) {
      case 'zh':
        return '中文（简）';
      case 'ja':
        return '日本語';
      default:
        return 'English';
    }
  };

  const handleStarClick = async () => {
    if (!userId) {
      toast.error('User not found');
      return;
    }
    if (!termId) {
      toast.error('Term not found');
      return;
    }

    setIsSaving(true);
    if (saved) {
      const res = await unsaveTermAction({ userId, termId });
      if (res.success) {
        setSaved(false);
      } else {
        toast.error(res.error);
      }
    } else {
      const res = await saveTermAction({ userId, termId });
      if (res.success) {
        setSaved(true);
      } else {
        toast.error(res.error);
      }
    }
    setIsSaving(false);
  };

  if (unActivate) return;

  const loadingCircle = (
    <div className="flex w-full items-center justify-center py-[55%]">
      <LoadingCircle size={20} />
    </div>
  );

  const content = (
    <>
      <CardHeader className="pt-3 pl-4 flex flex-row items-baseline gap-1">
        <X
          size={16}
          className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
          onClick={() => setOpenTerm(false)}
        />
        <CardTitle className="text-2xl">{term?.displayName}</CardTitle>
        <TooltipWrapper
          side="bottom"
          label={saved ? t('termInfo.unsaveLabel') : t('termInfo.saveLabel')}
        >
          <Button
            variant="ghost"
            className="cursor-pointer"
            size="icon"
            onClick={handleStarClick}
            disabled={isSaving}
          >
            <Star
              size={16}
              className={
                saved ? 'fill-yellow-400 text-yellow-400 transition-colors' : ''
              }
            />
          </Button>
        </TooltipWrapper>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {term?.translations.map((t) => (
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
    </>
  );

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      <Card className="h-140 w-120 overflow-y-auto rounded-md bg-background py-0 relative gap-8">
        {isLoading ? loadingCircle : content}
      </Card>
    </div>,
    document.body,
  );
}
