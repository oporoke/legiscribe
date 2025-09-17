'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FileUploadViewProps {
  onProcess: (file: File) => void;
}

export function FileUploadView({ onProcess }: FileUploadViewProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 1024 * 1024 * 10, // 10MB
    multiple: false,
  });

  const handleProcessClick = () => {
    if (file) {
      onProcess(file);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Upload Bill Draft</CardTitle>
          <CardDescription>Upload a text, PDF or Word document for processing and review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <FileUp className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">
                {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">TXT, PDF, DOC, DOCX (up to 10MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-secondary/50 p-4">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <Button
            onClick={handleProcessClick}
            disabled={!file}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            Process Bill
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
