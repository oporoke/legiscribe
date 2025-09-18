'use client';

import type { CompareBillsOutput } from '@/ai/flows/compare-bills';
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

interface BillComparisonProps {
  comparison: CompareBillsOutput;
}

export function BillComparison({ comparison }: BillComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Report</CardTitle>
        <CardDescription>
          An AI-generated analysis of the differences between the two bill versions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2">
              High-Level Summary of Changes
            </h3>
            <p className="prose prose-sm max-w-none text-muted-foreground">
              {comparison.comparisonSummary}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold font-headline mb-4">
              Detailed Section Changes
            </h3>
            {comparison.changedSections.length > 0 ? (
              <Accordion type="multiple" className="w-full space-y-4">
                {comparison.changedSections.map((section, index) => (
                  <AccordionItem
                    key={index}
                    value={`section-${index}`}
                    className="border-b-0"
                  >
                    <Card className="transition-all hover:shadow-md overflow-hidden">
                      <AccordionTrigger className="p-6 text-left hover:no-underline">
                        <h4 className="text-base font-medium leading-tight flex-1 pr-4">
                          {section.sectionTitle}
                        </h4>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-primary">
                            Implication of Change
                          </h5>
                          <p className="prose prose-sm max-w-none text-foreground">
                            {section.implication}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border rounded-md p-4 bg-red-50/50">
                            <h6 className="font-semibold text-sm mb-2 text-red-800">
                              Original Text
                            </h6>
                            <ScrollArea className="h-48">
                              <p className="prose prose-sm max-w-none text-red-900 whitespace-pre-wrap">
                                {section.originalText}
                              </p>
                            </ScrollArea>
                          </div>
                          <div className="border rounded-md p-4 bg-green-50/50">
                            <h6 className="font-semibold text-sm mb-2 text-green-800">
                              Amended Text
                            </h6>
                             <ScrollArea className="h-48">
                              <p className="prose prose-sm max-w-none text-green-900 whitespace-pre-wrap">
                                {section.amendedText}
                              </p>
                            </ScrollArea>
                          </div>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-sm">
                The AI did not detect any significant changes between the two documents.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
