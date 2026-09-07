import { TagInfoList } from '../schemas/term-form.schema';

interface TagField {
  id: string;
  tagId: string;
  name: string;
}

export interface AttachTagProps {
  tagFields: TagField[];
  removeTag: (index: number) => void;
  appendTag: (val: TagInfoList) => void;
}
