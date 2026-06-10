import { Card } from '@/shared/components/ui/card';
import { ImportTerm } from './import-term';
import { ClickCard } from '@/shared/components/ui/click-card';
import { countDictionary } from '../actions/count-dictionary.action';
import { toast } from 'sonner';

export async function DictionaryDataDisplay() {
  const res = await countDictionary();
  if (!res.success) toast.error(`Term and tag's number retrieval failed`);
  const { termCount, tagCount } = res.data!;

  return (
    <div className="grid grid-cols-3 mt-10">
      <div className="flex items-center justify-center">
        <ClickCard className="w-50 h-50 flex items-center justify-center">
          <span className="text-3xl font-bold">Term</span>
          <span>{termCount}</span>
          {/* <Button></Button> */}
        </ClickCard>
      </div>
      <div className="flex items-center justify-center">
        <Card className="w-50 h-50 flex items-center justify-center">
          <span className="text-3xl font-bold">Tag</span>
          <span>{tagCount}</span>
        </Card>
      </div>
      <div className="flex items-center justify-center">
        <ImportTerm />
      </div>
    </div>
  );
}
