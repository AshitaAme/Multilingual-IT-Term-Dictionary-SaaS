import { TagInfoInput } from '../schemas/term-form.schema';

interface TagField {
  id: string;
  tagId: string;
  name: string;
}

export interface SearchTagProps {
  tagFields: TagField[];
  removeTag: (index: number) => void;
  appendTag: (val: TagInfoInput) => void;
  className?: string;
}
