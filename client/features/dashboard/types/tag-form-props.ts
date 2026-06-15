import { TagFormInput } from '../schemas/tag-form.schema';

export interface TagFormProps {
  isUpdate?: boolean;
  currentTag?: TagFormInput;
  open: boolean;
  setOpen: (val: boolean) => void;
}
