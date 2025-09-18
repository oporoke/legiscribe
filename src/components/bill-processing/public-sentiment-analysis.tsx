'use client';

import type { AnalyzePublicSentimentOutput } from '@/ai/flows/analyze-public-sentiment';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareQuote, TrendingUp, Tags, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface PublicSentimentAnalysisProps {
  analysis: AnalyzePublicSentimentOutput;
}

const getSentimentBadgeClass = (sentiment: AnalyzePublicSentimentOutput['overallSentiment']) => {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700';
    case 'Negative':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700';
    case 'Mixed':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700';
    case 'Neutral':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getArgumentIcon = (side: string) => {
  const lowerSide = side.toLowerCase();
  if (lowerSide.includes('for')) return <ThumbsUp className="h-4 w-4 text-green-500" />;
  if (lowerSide.includes('against')) return <ThumbsDown className="h-4 w-4 text-red-500" />;
  if (lowerSide.includes('concern')) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  return null;
}

export function PublicSentimentAnalysis({ analysis }: PublicSentimentAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Public Sentiment Analysis</CardTitle>
            <CardDescription>
              An AI-simulated analysis of public discussion and media coverage.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold font-headline mb-3 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Overall Sentiment
            </h3>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Badge className={cn("text-base px-4 py-1.5", getSentimentBadgeClass(analysis.overallSentiment))}>
                    {analysis.overallSentiment}
                </Badge>
                <p className="prose prose-sm max-w-none text-muted-foreground flex-1">
                    {analysis.sentimentSummary}
                </p>
            </div>
        </div>

        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold font-headline mb-4">Key Arguments</h3>
          <div className="space-y-3">
            {analysis.keyArguments.map((arg, index) => (
              <div key={index} className="flex items-start gap-4 rounded-lg border bg-card/50 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getArgumentIcon(arg.side)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{arg.side}</p>
                  <p className="text-sm text-muted-foreground">{arg.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
            <h3 className="text-lg font-semibold font-headline mb-3 flex items-center">
                <Tags className="mr-2 h-5 w-5" />
                Key Discussion Topics
            </h3>
            <div className="flex flex-wrap gap-2">
                {analysis.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                        {topic}
                    </Badge>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
