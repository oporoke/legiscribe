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
import { BrainCircuit, FileTextIcon, Download, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeStakeholdersOutput } from '@/ai/flows/analyze-stakeholders';

interface BillSummaryProps {
  summary: string;
  originalText: string;
  fileName: string;
  stakeholderAnalysis?: AnalyzeStakeholdersOutput;
}

export function BillSummary({ summary, originalText, fileName, stakeholderAnalysis }: BillSummaryProps) {
  const { toast } = useToast();
  
  const getFormattedText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim().startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold font-headline mt-8 mb-4 border-b pb-2">
            {paragraph.replace(/## /g, '')}
          </h2>
        );
      }
      if (paragraph.trim().startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold font-headline mt-6 mb-3">
            {paragraph.replace(/### /g, '')}
          </h3>
        );
      }
      if (/^\*\*PART.*?\*\*/.test(paragraph.trim())) {
        return (
          <h4 key={index} className="text-lg font-bold mt-6 mb-2">
            {paragraph.replace(/\*\*/g, '')}
          </h4>
        );
      }
      if (/^\* \*\*Clause.*?\*\*/.test(paragraph.trim())) {
        return (
          <h5 key={index} className="text-base font-semibold mt-4 mb-1">
             {paragraph.replace(/\* \*\*/g, '').replace(/\*\*/g, '')}
          </h5>
        )
      }
      if(paragraph.trim().startsWith('- ')){
         return <p key={index} className="mb-2 pl-4">{paragraph}</p>;
      }
      return (
        <p key={index} className="mb-4 last:mb-0 leading-relaxed">
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
        <CardTitle>Bill Analysis</CardTitle>
        <CardDescription>
          Review AI-generated analyses or the original bill text.
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
             {stakeholderAnalysis && (
              <TabsTrigger value="stakeholders">
                <Users className="mr-2 h-4 w-4" />
                Stakeholder Analysis
              </TabsTrigger>
            )}
          </TabsList>
          <ScrollArea className="w-full mt-4 pr-4 h-[60vh]">
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
             {stakeholderAnalysis && (
              <TabsContent value="stakeholders">
                <div className="space-y-6 text-foreground">
                  <div>
                    <h3 className="text-xl font-semibold font-headline mb-3">Overall Impact Summary</h3>
                    <p className="text-muted-foreground">{stakeholderAnalysis.overallImpactSummary}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-headline mb-4">Impact on Specific Groups</h3>
                     <div className="space-y-4">
                      {stakeholderAnalysis.stakeholderImpacts.map((impact, index) => (
                        <Card key={index} className="bg-card/50">
                          <CardHeader>
                            <CardTitle className="text-lg">{impact.stakeholderGroup}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-semibold text-sm mb-2 text-primary">Impact Summary</h4>
                                <p className="text-sm text-muted-foreground">{impact.impactSummary}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-primary">Potential Effects</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                  {impact.potentialEffects.map((effect, i) => <li key={i}>{effect}</li>)}
                                </ul>
                              </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
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
