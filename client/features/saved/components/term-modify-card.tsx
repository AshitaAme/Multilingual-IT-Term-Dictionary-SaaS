'use client';

import { X } from 'lucide-react';
import { useModifyStore } from '../stores/saved.store';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { FieldSeparator } from '@/shared/components/ui/field';
import { useState } from 'react';
import Editor from '@/shared/components/ui/editor';

export function TermModifyCard() {
  const term = useModifyStore((state) => state.modifiedTerm);
  const setModifiedTerm = useModifyStore((state) => state.setModifiedTerm);
  const [content, setContent] = useState(term?.text);

  if (term === null) return;
  return (
    <Card className="w-120 h-160 rounded-md relative bg-background p-4">
      <X
        size={16}
        onClick={() => setModifiedTerm(null)}
        className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
      />
      <CardTitle>{term.name}</CardTitle>
      <FieldSeparator />
      <CardContent>
        <Editor content={content} onChange={setContent} />
      </CardContent>
    </Card>
  );
}
