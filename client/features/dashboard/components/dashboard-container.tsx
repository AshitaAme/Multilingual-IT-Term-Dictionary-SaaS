import { DictionaryDataDisplay } from './dictionary-data-display';
import { UserDataDisplay } from './user-data-display';

export function DashboardContainer() {
  return (
    <div className="flex flex-col">
      <DictionaryDataDisplay />
      <UserDataDisplay />
    </div>
  );
}
