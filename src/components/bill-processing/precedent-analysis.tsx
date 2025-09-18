'use client';

import type { AnalyzePrecedentOutput } from '@/ai/flows/analyze-precedent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { History } from 'lucide-react';

interface PrecedentAnalysisProps {
  analysis: AnalyzePrecedentOutput;
}

export function PrecedentAnalysis({ analysis }: PrecedentAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Legal Precedent & Historical Analysis</CardTitle>
            <CardDescription>
              An AI-generated analysis of the bill's historical and legal context.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2">
              Historical Context
            </h3>
            <p className="prose prose-sm max-w-none text-muted-foreground">
              {analysis.historicalContext}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold font-headline mb-4">
              Related Precedents & Legislation
            </h3>
            {analysis.precedents.length > 0 ? (
              <Accordion type="multiple" className="w-full space-y-4">
                {analysis.precedents.map((precedent, index) => (
                  <AccordionItem
                    key={index}
                    value={`precedent-${index}`}
                    className="border-b-0"
                  >
                    <Card className="transition-all hover:shadow-md overflow-hidden bg-card/50">
                      <AccordionTrigger className="p-6 text-left hover:no-underline">
                        <h4 className="text-base font-medium leading-tight flex-1 pr-4">
                          {precedent.precedentName}
                        </h4>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="prose prose-sm max-w-none text-foreground">
                          <p>{precedent.description}</p>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-sm">
                The AI did not identify any specific legal precedents for this bill.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
