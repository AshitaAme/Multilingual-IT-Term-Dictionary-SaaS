import { TagFormInput } from '../schemas/tag-form.schema';

export interface TagFormProps {
  isUpdate?: boolean;
  currentTag?: TagFormInput;
  onClose: () => void;
}
