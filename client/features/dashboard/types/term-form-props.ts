import { TermFormInput } from '../schemas/term-form.schema';

export interface TermFormProps {
  isUpdate: boolean;
  currentTerm?: TermFormInput;
  onClose: () => void;
}
