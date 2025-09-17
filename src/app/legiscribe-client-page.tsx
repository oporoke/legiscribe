'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processBill } from '@/lib/actions';
import type { ProcessedBill } from '@/lib/types';
import { FileUploadView } from '@/components/bill-processing/file-upload-view';
import { BillProcessingView } from '@/components/bill-processing/bill-processing-view';
import { Loader2 } from 'lucide-react';

export function LegiscribeClientPage() {
  const [bill, setBill] = useState<ProcessedBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleProcessBill = async (file: File) => {
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target?.result as string;
      const result = await processBill({ fileName: file.name, fileContent, fileType: file.type });
      setIsLoading(false);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Processing Error',
          description: result.error,
        });
      } else if (result.bill) {
        setBill(result.bill);
        toast({
          title: 'Processing Complete',
          description: `Successfully processed ${result.bill.fileName}.`,
        });
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the selected file.',
      });
    }
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setBill(null);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Processing bill, please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {!bill ? (
        <FileUploadView onProcess={handleProcessBill} />
      ) : (
        <BillProcessingView bill={bill} onReset={handleReset} />
      )}
    </div>
  );
}