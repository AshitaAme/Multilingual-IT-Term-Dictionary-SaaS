import { TagInfoInput } from '../schemas/term-form.schema';

export interface SearchTagProps {
  clickedTagSet: Set<TagInfoInput>;
  appendTag: (val: TagInfoInput) => void;
}
