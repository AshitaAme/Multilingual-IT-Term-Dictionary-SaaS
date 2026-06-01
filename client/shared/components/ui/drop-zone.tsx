'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp } from 'lucide-react';
import { Card } from './card';

// Defines the allowed file extensions as a union type
export const AcceptedFileExtensions = ['tbx', 'csv'] as const;
export type AcceptedFileType = (typeof AcceptedFileExtensions)[number];

export function DropZone() {
  // useCallback memoizes the onDrop handler to prevent unnecessary re-renders
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files to only allow .tbx and .csv extensions
    const filtered = acceptedFiles.filter((file) => {
      const ext = file.name.split('.').pop() as AcceptedFileType;
      return AcceptedFileExtensions.includes(ext);
    });
    console.log(filtered);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Restrict accepted MIME types and file extensions
    accept: {
      'text/csv': ['.csv'],
      'application/x-tbx': ['.tbx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB in bytes
  });

  return (
    // getRootProps() spreads drag-and-drop event listeners onto the Card
    <Card
      {...getRootProps()}
      className="w-full h-full border-2 border-dashed border-foreground rounded-lg flex flex-col items-center justify-center cursor-pointer"
    >
      {/* getInputProps() wires up the hidden file input for click-to-upload */}
      <input {...getInputProps()} />
      <FileUp className="mb-2" />
      <span>
        {isDragActive ? 'Drop the file here...' : 'Choose a file up to 50MB'}
      </span>
    </Card>
  );
}
