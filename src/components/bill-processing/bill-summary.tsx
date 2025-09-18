'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrainCircuit, FileTextIcon, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface BillSummaryProps {
  summary: string;
  originalText: string;
  fileName: string;
}

export function BillSummary({ summary, originalText, fileName }: BillSummaryProps) {
  const { toast } = useToast();
  
  const getFormattedText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (
        /^(Article|Section|Part)\. \w+\./.test(paragraph.trim()) ||
        paragraph.trim() === 'CONSTITUTION OF THE UNITED STATES'
      ) {
        return (
          <h3
            key={index}
            className="text-lg font-bold font-headline mt-4 mb-2"
          >
            {paragraph}
          </h3>
        );
      }
      return (
        <p key={index} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Summary - ${fileName.replace(/\.[^/.]+$/, "")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: 'Your summary document is downloading.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not prepare the document for download.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill Text</CardTitle>
        <CardDescription>
          View the AI-generated summary or the original bill text.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">
              <BrainCircuit className="mr-2 h-4 w-4" />
              AI Summary
            </TabsTrigger>
            <TabsTrigger value="original">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Original Text
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="w-full mt-4 pr-4 max-h-[60vh]">
            <TabsContent value="summary">
              <div className="prose prose-sm max-w-none text-foreground">
                {getFormattedText(summary)}
              </div>
            </TabsContent>
            <TabsContent value="original">
              <div className="prose prose-sm max-w-none text-foreground">
                {getFormattedText(originalText)}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
      <CardFooter>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
      </CardFooter>
    </Card>
  );
}
