import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Voter } from '@votexa/shared';

export function VoterRow({ voter }: { voter: Voter }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="space-y-1">
        <span className="font-mono text-sm font-semibold">{voter.voterCode}</span>
        <p className="text-xs text-muted-foreground">{voter.email || 'Anonymous Verified Voter'}</p>
      </div>
      <div className="flex items-center gap-2">
        {voter.hasVoted ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Voted
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3.5 w-3.5" /> Not Voted
          </Badge>
        )}
      </div>
    </div>
  );
}

export function VoterDirectory({ voters }: { voters: Voter[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Registered Voters Directory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {voters.map((v) => (
          <VoterRow key={v.id} voter={v} />
        ))}
      </CardContent>
    </Card>
  );
}
