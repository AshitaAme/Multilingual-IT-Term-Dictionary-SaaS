'use client';

import { X } from 'lucide-react';
import { useModifyStore } from '../stores/saved.store';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { FieldSeparator } from '@/shared/components/ui/field';
import { useState } from 'react';
import Editor from '@/shared/components/ui/editor';
import { Button } from '@/shared/components/ui/button';
import { saveTerms } from '@/features/search/services/save-term';

export function TermModifyCard() {
  const term = useModifyStore((state) => state.modifiedTerm);
  const setModifiedTerm = useModifyStore((state) => state.setModifiedTerm);
  const [content, setContent] = useState(term?.text);
  const [isSaving, setIsSaving] = useState(false);

  if (term === null) return;
  const handleSaveText = async () => {
    setIsSaving(true);
    const res = await saveTermText({
      savedTermId: term.savedTermId,
      newText: content,
    });
    setIsSaving(false);
  };
  return (
    <Card className="w-120 h-160 rounded-md relative bg-background p-4">
      <X
        size={16}
        onClick={() => setModifiedTerm(null)}
        className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
      />
      <CardTitle className="text-2xl px-2">{term.name}</CardTitle>
      <FieldSeparator />
      <CardContent className="flex flex-col gap-5.5">
        <Editor content={content} onChange={setContent} />
        <Button
          disabled={isSaving}
          onClick={handleSaveText}
          className="bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground/60 hover:text-foreground"
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
