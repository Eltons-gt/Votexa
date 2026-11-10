import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { User } from 'lucide-react';
import { Candidate } from '@votexa/shared';

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {candidate.avatarUrl ? (
            <img src={candidate.avatarUrl} alt={candidate.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
        <div>
          <CardTitle className="text-base">{candidate.name}</CardTitle>
          <span className="text-xs text-muted-foreground">Ballot Order #{candidate.ballotOrder}</span>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{candidate.bio || 'No candidate statement provided.'}</CardDescription>
      </CardContent>
    </Card>
  );
}
