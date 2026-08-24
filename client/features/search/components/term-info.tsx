'use client';

import { Separator } from '@/shared/components/ui/separator';
import { createPortal } from 'react-dom';
import { useOpenTermStore, useSearchOptionStore } from '../stores/search.store';
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
import { getLanguage } from '@/shared/utils/utils';
import { getTextFromTerm } from '../utils/get-text-from-term';

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
  const [isTogglingStar, setIsTogglingStar] = useState(false);
  const toSaveBook = useSearchOptionStore((state) => state.toSaveBook);

  // Check whether the term is saved
  useEffect(() => {
    const checkSave = async () => {
      setIsLoading(true);
      if (unActivate) return;
      if (!userId) {
        toast.error(t('termInfo.invalidUserId'));
        return;
      }
      if (!termId) {
        toast.error(t('termInfo.invalidTermId'));
        return;
      }
      const res = await checkSavedTermAction(termId);
      if (res.success) setSaved(res.data!);
      else toast.error(res.error);
      setIsLoading(false);
    };
    checkSave();
  }, [unActivate, termId, userId, t]);

  // Save / unsave term
  const handleSaveClick = async () => {
    // Check auth and availability
    if (!userId) {
      toast.error(t('termInfo.invalidUserId'));
      return;
    }
    if (!termId) {
      toast.error(t('termInfo.invalidTermId'));
      return;
    }

    // Start
    setIsTogglingStar(true);
    if (saved) {
      const res = await unsaveTermAction(termId);
      if (res.success) {
        setSaved(false);
      } else {
        toast.error(res.error);
      }
    } else {
      const res = await saveTermAction([
        {
          savedBookId: toSaveBook.id,
          termId,
          name: term.displayName,
          text: getTextFromTerm(term),
        },
      ]);
      if (res.success) {
        setSaved(true);
      } else {
        toast.error(res.error);
      }
    }
    setIsTogglingStar(false);
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
        {/* Term name */}
        <CardTitle className="text-2xl">{term?.displayName}</CardTitle>
        {/* Save / unsave */}
        <TooltipWrapper
          side="bottom"
          label={saved ? t('termInfo.unsaveLabel') : t('termInfo.saveLabel')}
        >
          <Button
            variant="ghost"
            className="cursor-pointer"
            size="icon"
            onClick={handleSaveClick}
            disabled={isTogglingStar}
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

      {/* Term information */}
      <CardContent className="flex flex-col gap-6">
        {term?.translations.map((translation) => (
          <div key={translation.languageCode} className="flex flex-col gap-2">
            <span className="flex gap-2">
              <span>{translation.name}</span>
              <span>{getLanguage(translation.languageCode)}</span>
            </span>
            <Separator />
            <p>{translation.definition}</p>
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
