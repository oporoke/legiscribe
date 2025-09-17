'use client';

import { useState, useMemo } from 'react';
import type { ProcessedBill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClauseCard } from './clause-card';
import { Download, RotateCcw } from 'lucide-react';
import { BillSummary } from './bill-summary';
import { explainClause } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface BillProcessingViewProps {
  bill: ProcessedBill;
  onReset: () => void;
}

type VoteStatus = 'pending' | 'approved' | 'rejected';

export function BillProcessingView({ bill, onReset }: BillProcessingViewProps) {
  const [votes, setVotes] = useState<Record<string, VoteStatus>>(() =>
    bill.clauses.reduce((acc, clause) => {
      acc[clause.clauseId] = 'pending';
      return acc;
    }, {} as Record<string, VoteStatus>)
  );
  
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleVote = (clauseId: string, vote: 'approved' | 'rejected') => {
    setVotes((prev) => ({ ...prev, [clauseId]: prev[clauseId] === vote ? 'pending' : vote }));
  };

  const handleExplainClause = async (clauseId: string, clauseText: string) => {
    setExplanationLoading((prev) => ({ ...prev, [clauseId]: true }));
    setExplanations((prev) => ({ ...prev, [clauseId]: '' })); // Clear previous

    const result = await explainClause({ clauseText, billText: bill.originalText });
    
    setExplanationLoading((prev) => ({ ...prev, [clauseId]: false }));
    
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Explanation Failed',
        description: result.error,
      });
    } else if (result.explanation) {
      setExplanations((prev) => ({ ...prev, [clauseId]: result.explanation! }));
    }
  };
  
  const { votedCount, totalCount, progress } = useMemo(() => {
    const totalCount = bill.clauses.length;
    const votedCount = Object.values(votes).filter((v) => v !== 'pending').length;
    const progress = totalCount > 0 ? (votedCount / totalCount) * 100 : 0;
    return { votedCount, totalCount, progress };
  }, [votes, bill.clauses.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Bill Review: {bill.fileName}</h1>
          <p className="text-muted-foreground">Review and vote on individual clauses.</p>
        </div>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Process New Bill
        </Button>
      </div>

        <BillSummary summary={bill.summary} originalText={bill.originalText} />

        <Card>
          <CardHeader>
            <CardTitle>Clause Voting</CardTitle>
            <CardDescription>Approve or reject each clause of the bill. Your progress is saved automatically.</CardDescription>
            <div className="pt-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{votedCount} / {totalCount} clauses voted</span>
                </div>
                <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bill.clauses.map((clause) => (
              <ClauseCard
                key={clause.clauseId}
                clause={clause}
                voteStatus={votes[clause.clauseId]}
                onVote={handleVote}
                onExplain={handleExplainClause}
                explanation={explanations[clause.clauseId]}
                isExplanationLoading={explanationLoading[clause.clauseId]}
              />
            ))}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-end">
              <Button variant="outline" disabled={progress < 100}>
                  <Download className="mr-2 h-4 w-4" /> Download as Word
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={progress < 100}>
                  <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
