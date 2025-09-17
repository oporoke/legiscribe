'use client';

import { ThumbsUp, ThumbsDown, CircleDot } from 'lucide-react';
import type { Clause } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

type VoteStatus = 'pending' | 'approved' | 'rejected';

interface ClauseCardProps {
  clause: Clause;
  voteStatus: VoteStatus;
  onVote: (clauseId: string, vote: 'approved' | 'rejected') => void;
}

export function ClauseCard({ clause, voteStatus, onVote }: ClauseCardProps) {
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

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Clause {clause.clauseNumber}</CardTitle>
        <Badge variant={getBadgeVariant()} className="capitalize">{getBadgeContent()}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{clause.text}</p>
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
    </Card>
  );
}
