'use client';

import { useState, useMemo } from 'react';
import type { ProcessedBill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClauseCard } from './clause-card';
import { RotateCcw } from 'lucide-react';
import { BillSummary } from './bill-summary';
import { BillComparison } from './bill-comparison';
import { explainClause } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Accordion } from '@/components/ui/accordion';

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
    if (explanations[clauseId]) return;

    setExplanationLoading((prev) => ({ ...prev, [clauseId]: true }));
    try {
      const explanation = await explainClause({ clauseText, billText: bill.originalText });
      setExplanations((prev) => ({ ...prev, [clauseId]: explanation }));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Explanation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setExplanationLoading((prev) => ({ ...prev, [clauseId]: false }));
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

      {bill.comparison ? (
          <BillComparison comparison={bill.comparison} />
      ) : (
          <BillSummary summary={bill.summary} originalText={bill.originalText} fileName={bill.fileName} />
      )}


      <Card>
        <CardHeader>
          <CardTitle>Clause Voting (Original Bill)</CardTitle>
          <CardDescription>Approve or reject each clause of the bill. Your progress is saved automatically.</CardDescription>
          <div className="pt-2">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{votedCount} / {totalCount} clauses voted</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {bill.clauses.map((clause) => (
              <ClauseCard
                key={clause.clauseId}
                clause={clause}
                voteStatus={votes[clause.clauseId]}
                onVote={handleVote}
                onExplain={handleExplainClause}
                explanation={explanations[clause.clauseId]}
                isExplanationLoading={explanationLoading[clause.clauseId]}
                setExplanationLoading={(isLoading) => setExplanationLoading(prev => ({...prev, [clause.clauseId]: isLoading}))}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
