'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FileUp, FileText, X, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FileUploadViewProps {
  onProcess: (originalFile: File, amendedFile?: File | null) => void;
}

const dropzoneOptions = {
  accept: {
    'text/plain': ['.txt'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize: 1024 * 1024 * 10, // 10MB
  multiple: false,
};

function FileDropzone({ file, setFile, title }: { file: File | null, setFile: (file: File | null) => void, title: string }) {
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
    // You can handle rejections here if needed, e.g., show a toast notification.
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, ...dropzoneOptions });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <div className="w-full">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      {!file ? (
        <div
          {...getRootProps()}
          className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          <FileUp className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop a file, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">TXT, PDF, DOC, DOCX (up to 10MB)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border bg-secondary/50 p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function FileUploadView({ onProcess }: FileUploadViewProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [amendedFile, setAmendedFile] = useState<File | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const handleProcessClick = () => {
    if (originalFile) {
      onProcess(originalFile, isCompareMode ? amendedFile : null);
    }
  };

  const isProcessButtonDisabled = !originalFile || (isCompareMode && !amendedFile);

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Files className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Process a Bill</CardTitle>
          <CardDescription>Upload a single bill for analysis or compare two versions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 py-6">
          <div className="flex items-center justify-center space-x-2">
            <Label htmlFor="compare-mode">Single Document</Label>
            <Switch id="compare-mode" checked={isCompareMode} onCheckedChange={setIsCompareMode} />
            <Label htmlFor="compare-mode">Compare Two Documents</Label>
          </div>
          
          <div className={`grid gap-6 ${isCompareMode ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            <FileDropzone file={originalFile} setFile={setOriginalFile} title="Original Bill" />
            {isCompareMode && (
              <FileDropzone file={amendedFile} setFile={setAmendedFile} title="Amended Bill" />
            )}
          </div>
          
          <Button
            onClick={handleProcessClick}
            disabled={isProcessButtonDisabled}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            {isCompareMode ? 'Compare Bills' : 'Process Bill'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
