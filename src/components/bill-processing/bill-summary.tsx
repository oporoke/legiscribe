'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrainCircuit, FileTextIcon } from 'lucide-react';

interface BillSummaryProps {
  summary: string;
  originalText: string;
}

export function BillSummary({ summary, originalText }: BillSummaryProps) {
  const getFormattedText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      // Check for headings like "Article. I." or "Section. 1."
      if (
        /^(Article|Section)\. \w+\./.test(paragraph.trim()) ||
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
          <ScrollArea className="h-96 w-full mt-4 pr-4">
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
    </Card>
  );
}
