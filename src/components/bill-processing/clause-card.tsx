'use client';

import { ThumbsUp, ThumbsDown, CircleDot, BrainCircuit, Loader2 } from 'lucide-react';
import type { Clause } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

type VoteStatus = 'pending' | 'approved' | 'rejected';

interface ClauseCardProps {
  clause: Clause;
  voteStatus: VoteStatus;
  onVote: (clauseId: string, vote: 'approved' | 'rejected') => void;
  onExplain: (clauseId: string, clauseText: string) => void;
  explanation: string | undefined;
  isExplanationLoading: boolean | undefined;
  setExplanationLoading: (isLoading: boolean) => void;
}

export function ClauseCard({ clause, voteStatus, onVote, onExplain, explanation, isExplanationLoading, setExplanationLoading }: ClauseCardProps) {

    const getBadgeVariant = () => {
        switch (voteStatus) {
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };
    
    const getBadgeContent = () => {
        switch (voteStatus) {
            case 'approved': return <><ThumbsUp className="mr-1 h-3 w-3" /> Approved</>;
            case 'rejected': return <><ThumbsDown className="mr-1 h-3 w-3" /> Rejected</>;
            default: return <><CircleDot className="mr-1 h-3 w-3" /> Pending</>;
        }
    }

    const handleExplainClick = () => {
      onExplain(clause.clauseId, clause.text);
    };

    useEffect(() => {
      // When explanation is loaded (either with content or empty for an error), stop loading.
      if (explanation !== undefined && isExplanationLoading) {
        setExplanationLoading(false);
      }
    }, [explanation, isExplanationLoading, setExplanationLoading]);


  return (
    <AccordionItem value={clause.clauseId} className="border-b-0">
      <Card className="transition-all hover:shadow-md overflow-hidden">
        <AccordionTrigger className="p-6 hover:no-underline">
          <div className="flex w-full flex-row items-start justify-between space-x-4 text-left">
            <div className='pr-4'>
                <h3 className="text-lg font-medium leading-tight">Clause {clause.clauseNumber}</h3>
            </div>
            <Badge variant={getBadgeVariant()} className="capitalize whitespace-nowrap">{getBadgeContent()}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-6 pb-6 space-y-4">
            <p className="text-base text-muted-foreground">{clause.text}</p>
            
            <div className="border-t pt-4">
              <Button
                  variant="ghost"
                  className="w-full justify-start px-0 text-accent hover:text-accent/90 mb-4"
                  onClick={handleExplainClick}
                  disabled={isExplanationLoading}
              >
                {isExplanationLoading ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                Explain with AI
              </Button>

              {explanation && (
                <div className="border-t bg-muted/50 p-4 rounded-md">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <p>{explanation}</p>
                    </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button
                size="sm"
                variant={voteStatus === 'rejected' ? 'destructive' : 'outline'}
                onClick={() => onVote(clause.clauseId, 'rejected')}
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button
                size="sm"
                variant={voteStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => onVote(clause.clauseId, 'approved')}
                className={cn(voteStatus === 'approved' && 'bg-green-600 hover:bg-green-700')}
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
              </Button>
            </div>
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
