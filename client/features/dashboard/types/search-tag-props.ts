import { TagInfoInput } from '../schemas/term-form.schema';

export interface SearchTagProps {
  setOpenSearchTag: (val: boolean) => void;
  clickedTagSet: Set<TagInfoInput>;
  appendTag: (val: TagInfoInput) => void;
}
