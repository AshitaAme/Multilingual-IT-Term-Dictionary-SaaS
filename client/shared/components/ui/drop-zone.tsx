'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from './card';
import { transferTbx } from '@/shared/lib/scripts/transfer-tbx';

// Defines the allowed file extensions as a union type
export const AcceptedFileExtensions = ['tbx', 'csv'] as const;
export type AcceptedFileType = (typeof AcceptedFileExtensions)[number];

export function DropZone({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  const [isProcessing, setIsProcessing] = useState(false);

  // useCallback memoizes the onDrop handler to prevent unnecessary re-renders
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files to only allow .tbx and .csv extensions

    const filtered = acceptedFiles.filter((file) => {
      const ext = file.name.split('.').pop() as AcceptedFileType;
      return AcceptedFileExtensions.includes(ext);
    });

    setIsProcessing(true);
    try {
      console.log(`[${DropZone.name}]: Transfer started! `);
      filtered.forEach(async (file) => {
        try {
          const xml = await file.text();
          await transferTbx({ xml });
        } catch (e) {
          console.error('This file failed', file.name, e);
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    // Restrict accepted MIME types and file extensions
    accept: {
      'text/csv': ['.csv'],
      'application/x-tbx': ['.tbx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB in bytes
    noDrag: isProcessing,
    noClick: isProcessing,
  });

  return (
    // getRootProps() spreads drag-and-drop event listeners onto the Card
    <Card {...getRootProps()} className={className}>
      {children}
      <input {...getInputProps()} />
    </Card>
  );
}
