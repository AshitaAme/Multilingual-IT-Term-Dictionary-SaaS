'use client';

import { useModifyState } from '../stores/saved.store';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';

export function ModifyCard() {
  const term = useModifyState((state) => state.modifiedTerm);
  if (term === null) return;
  return (
    <Card className="">
      <CardTitle>{term.name}</CardTitle>
      <CardContent>{term.text}</CardContent>
    </Card>
  );
}
