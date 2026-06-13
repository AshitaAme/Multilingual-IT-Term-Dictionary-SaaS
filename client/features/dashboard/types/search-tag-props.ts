import { TagItem } from './tag-item';

export interface SearchTagProps {
  clickedTagSet: Set<TagItem>;
  setOpenSearchTag: (val: boolean) => void;
}
