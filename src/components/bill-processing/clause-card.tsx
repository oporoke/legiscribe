'use client';

import { ThumbsUp, ThumbsDown, CircleDot, BrainCircuit, Loader2 } from 'lucide-react';
import type { Clause } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type VoteStatus = 'pending' | 'approved' | 'rejected';

interface ClauseCardProps {
  clause: Clause;
  voteStatus: VoteStatus;
  onVote: (clauseId: string, vote: 'approved' | 'rejected') => void;
  onExplain: (clauseId: string, clauseText: string) => void;
  explanation: string | undefined;
  isExplanationLoading: boolean | undefined;
}

export function ClauseCard({ clause, voteStatus, onVote, onExplain, explanation, isExplanationLoading }: ClauseCardProps) {
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);

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
      const newVisibility = !isExplanationVisible;
      setIsExplanationVisible(newVisibility);
      // Fetch explanation only when opening and it hasn't been fetched yet
      if (newVisibility && !explanation) {
        onExplain(clause.clauseId, clause.text);
      }
    };

  return (
    <Card className="transition-all hover:shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className='pr-4'>
            <CardTitle className="text-lg font-medium leading-tight">Clause {clause.clauseNumber}</CardTitle>
            <p className="pt-2 text-base text-muted-foreground">{clause.text}</p>
        </div>
        <Badge variant={getBadgeVariant()} className="capitalize whitespace-nowrap">{getBadgeContent()}</Badge>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex justify-end space-x-2">
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
      </CardContent>
      <CardFooter className="flex-col items-start p-0">
         <div className='w-full px-6 pb-2'>
            <Button
                variant="ghost"
                className="w-full justify-start px-0 text-accent hover:text-accent/90"
                onClick={handleExplainClick}
            >
                <BrainCircuit className="mr-2 h-4 w-4" />
                {isExplanationVisible ? 'Hide' : 'Explain with AI'}
            </Button>
         </div>

         <AnimatePresence>
          {isExplanationVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              <div className="border-t bg-muted/50 p-6">
                {isExplanationLoading && (
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating explanation...
                  </div>
                )}
                {explanation && (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p>{explanation}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}
