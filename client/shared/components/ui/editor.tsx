'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from './button';
import { AxeIcon, Bold, Italic, List } from 'lucide-react';
import { TooltipWrapper } from './tooltipWrapper';
import { cn } from '@/shared/utils/utils';
import { FieldSeparator } from './field';

export default function Editor({
  content = '',
  onChange,
}: Readonly<{
  content?: string;
  onChange?: (html: string) => void;
}>) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start enter...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="h-full border rounded-md">
      <div className="flex items-center justify-start p-2">
        <TooltipWrapper label={'Bold'} side="top">
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'font-bold text-blue-600' : ''}
          >
            <Bold />
          </Button>
        </TooltipWrapper>

        <TooltipWrapper label={'Italic'} side="top">
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'italic text-blue-600' : ''}
          >
            <Italic />
          </Button>
        </TooltipWrapper>

        <TooltipWrapper label={'Title'} side="top">
          <Button
            variant="ghost"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive('heading', { level: 2 }) ? 'text-blue-600' : ''
            }
          >
            <AxeIcon />
          </Button>
        </TooltipWrapper>

        <TooltipWrapper label={'Bullet list'} side="top">
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List />
          </Button>
        </TooltipWrapper>
      </div>
      <FieldSeparator />
      <EditorContent
        editor={editor}
        className={cn(
          'h-full prose [&_.ProseMirror]:outline-none [&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-full',
          'rounded-md ring-muted-foreground/20',
          'overflow-y-auto p-4',
        )}
      />
    </div>
  );
}
