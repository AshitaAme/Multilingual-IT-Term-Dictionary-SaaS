'use client';

import { X } from 'lucide-react';
import { useModifyStore } from '../stores/saved.store';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { FieldSeparator } from '@/shared/components/ui/field';
import { useState } from 'react';
import Editor from '@/shared/components/ui/editor';
import { Button } from '@/shared/components/ui/button';
import { updateTermTextAction } from '../actions/update-term-text.action';
import { toast } from 'sonner';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

export function TermModifyCard() {
  const modifiedTerm = useModifyStore((state) => state.modifiedTerm);
  const setModifiedTerm = useModifyStore((state) => state.setModifiedTerm);
  const setUpdatedText = useModifyStore((state) => state.setUpdatedText);
  const [content, setContent] = useState(modifiedTerm?.text);
  const [isUpdating, setIsUpdating] = useState(false);

  if (modifiedTerm === null) return;
  const handleUpdateText = async () => {
    setIsUpdating(true);
    const res = await updateTermTextAction({
      savedTermId: modifiedTerm.savedTermId,
      text: content || '',
    });
    if (!res.success) toast.error(res.error);
    else setUpdatedText(content || '');
    setIsUpdating(false);
  };
  return (
    <Card className="w-120 h-160 rounded-md relative bg-background p-4">
      <X
        size={16}
        onClick={() => setModifiedTerm(null)}
        className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
      />
      <CardTitle className="text-2xl px-2">{modifiedTerm.name}</CardTitle>
      <FieldSeparator />
      <CardContent className="flex flex-col gap-5.5 h-130">
        {isUpdating && (
          <div className="flex items-center justify-center h-full">
            <LoadingCircle />
          </div>
        )}
        {!isUpdating && <Editor content={content} onChange={setContent} />}

        <Button
          disabled={isUpdating}
          onClick={handleUpdateText}
          className="bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground/60 hover:text-foreground"
        >
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
