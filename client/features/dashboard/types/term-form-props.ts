import { TermFormInput } from '../schemas/term-form.schema';

export interface TermFormProps {
  isUpdate?: boolean;
  currentTerm?: TermFormInput;
  open: boolean;
  setOpen: (val: boolean) => void;
}
