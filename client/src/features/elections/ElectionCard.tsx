import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Share2 } from 'lucide-react';
import { Election, ElectionStatus } from '@votexa/shared';

export function ElectionCard({
  election,
  onSelect,
  onShare
}: {
  election: Election;
  onSelect?: (election: Election) => void;
  onShare?: (election: Election) => void;
}) {
  const getBadgeVariant = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return 'success';
      case ElectionStatus.SCHEDULED:
        return 'secondary';
      case ElectionStatus.CONCLUDED:
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant={getBadgeVariant(election.status)}>{election.status}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {election.timezone}
          </span>
        </div>
        <CardTitle className="mt-2 text-lg">{election.title}</CardTitle>
        <CardDescription className="line-clamp-2">{election.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(election.startTime).toLocaleDateString()} — {new Date(election.endTime).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <span className="text-xs font-medium text-primary">
          {election.isPaidVoting ? 'Paid Entry Voting' : 'Standard Ballot'}
        </span>
        <div className="flex items-center gap-1.5">
          {onShare && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onShare(election);
              }}
              className="gap-1 text-xs h-8 text-primary hover:bg-primary/10"
              title="Share Vote & QR Code"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onSelect && onSelect(election)} className="h-8 text-xs">
            Manage
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
