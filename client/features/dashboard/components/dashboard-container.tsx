import { cn } from '@/shared/utils/utils';
import { DictOperations } from './dict-operations';
import { UserOperations } from './user-operations';

export function DashboardContainer() {
  return (
    <div
      className={cn(
        'w-full h-full py-6 md:px-20 xl:px-100',
        'flex flex-col justify-center items-center',
      )}
    >
      <DictOperations />
      <UserOperations />
    </div>
  );
}
