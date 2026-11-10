import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Candidate, CandidateStatus, ElectionPosition, CreateCandidateRequest } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface CandidateManagementProps {
  electionId: string;
  isReadOnly?: boolean;
}

export function CandidateManagement({ electionId, isReadOnly = false }: CandidateManagementProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const [formName, setFormName] = useState('');
  const [formPosId, setFormPosId] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formManifesto, setFormManifesto] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formOrder, setFormOrder] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candRes, posRes] = await Promise.all([
        apiClient.get<Candidate[]>(`/candidates/election/${electionId}`),
        apiClient.get<ElectionPosition[]>(`/elections/${electionId}/positions`)
      ]);

      if (candRes.data) setCandidates(candRes.data);
      if (posRes.data) {
        setPositions(posRes.data);
        if (posRes.data.length > 0 && !formPosId) {
          setFormPosId(posRes.data[0]?.id || '');
        }
      }
    } catch {
      // Fallback sample data
      setPositions([
        {
          id: 'pos-1',
          electionId,
          organizationId: 'current',
          title: 'Student Body President',
          minSelections: 1,
          maxSelections: 1,
          orderIndex: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'pos-2',
          electionId,
          organizationId: 'current',
          title: 'Executive Vice President',
          minSelections: 1,
          maxSelections: 1,
          orderIndex: 1,
          createdAt: new Date().toISOString()
        }
      ]);
      setCandidates([
        {
          id: 'cand-1',
          electionId,
          organizationId: 'current',
          positionId: 'pos-1',
          name: 'Jordan Hayes',
          bio: 'Senior in Computer Science and Public Policy.',
          manifesto: 'Accessible student health care, transparent activity fee spending, and expanded study spaces.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          ballotOrder: 1,
          status: CandidateStatus.APPROVED,
          voteCount: 0
        },
        {
          id: 'cand-2',
          electionId,
          organizationId: 'current',
          positionId: 'pos-1',
          name: 'Morgan Chen',
          bio: 'Junior in Economics and Data Analytics.',
          manifesto: 'Campus transit pass subsidies, digital club grant processing, and dining options.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          ballotOrder: 2,
          status: CandidateStatus.APPROVED,
          voteCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [electionId]);

  const handleOpenCreate = () => {
    setEditingCandidate(null);
    setFormName('');
    setFormPosId(positions[0]?.id || '');
    setFormBio('');
    setFormManifesto('');
    setFormAvatar('');
    setFormOrder(candidates.length + 1);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormName(cand.name);
    setFormPosId(cand.positionId || positions[0]?.id || '');
    setFormBio(cand.bio || '');
    setFormManifesto(cand.manifesto || '');
    setFormAvatar(cand.avatarUrl || '');
    setFormOrder(cand.ballotOrder);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Candidate name is required');
      return;
    }
    if (!formPosId) {
      setError('Position selection is required');
      return;
    }

    try {
      if (editingCandidate) {
        await apiClient.put(`/candidates/${editingCandidate.id}`, {
          electionId,
          positionId: formPosId,
          name: formName.trim(),
          bio: formBio.trim(),
          manifesto: formManifesto.trim(),
          avatarUrl: formAvatar.trim(),
          ballotOrder: formOrder
        });
      } else {
        const payload: CreateCandidateRequest = {
          positionId: formPosId,
          name: formName.trim(),
          bio: formBio.trim(),
          manifesto: formManifesto.trim(),
          avatarUrl: formAvatar.trim(),
          ballotOrder: formOrder
        };
        await apiClient.post('/candidates', {
          ...payload,
          electionId
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError((err as Error).message || 'Failed to save candidate');
    }
  };

  const handleToggleStatus = async (cand: Candidate) => {
    const nextStatus =
      cand.status === CandidateStatus.APPROVED
        ? CandidateStatus.REJECTED
        : CandidateStatus.APPROVED;
    try {
      await apiClient.put(`/candidates/${cand.id}`, {
        electionId,
        status: nextStatus
      });
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to update candidate status');
    }
  };

  const handleDelete = async (candId: string) => {
    if (!confirm('Are you sure you want to remove this candidate?')) return;
    try {
      await apiClient.delete(`/candidates/${candId}?electionId=${electionId}`);
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to delete candidate');
    }
  };

  const filteredCandidates =
    selectedPositionId === 'all'
      ? candidates
      : candidates.filter((c) => c.positionId === selectedPositionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Registered Candidates & Contenders
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage candidates, position assignments, biographies, and campaign manifestos.
          </p>
        </div>
        {!isReadOnly && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            disabled={positions.length === 0}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" /> Register Candidate
          </Button>
        )}
      </div>

      {/* Position Filter Pills */}
      {positions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0">Filter Office:</span>
          <button
            onClick={() => setSelectedPositionId('all')}
            className={`px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
              selectedPositionId === 'all'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            All Offices ({candidates.length})
          </button>
          {positions.map((p) => {
            const count = candidates.filter((c) => c.positionId === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPositionId(p.id)}
                className={`px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
                  selectedPositionId === p.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                {p.title} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading candidates...</div>
      ) : positions.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <CardContent className="space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <p className="text-sm font-medium">Positions Must Be Created First</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Please define at least one election position before registering candidates.
            </p>
          </CardContent>
        </Card>
      ) : filteredCandidates.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <CardContent className="space-y-2">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">No candidates registered</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {selectedPositionId === 'all'
                ? 'No candidates have been registered for this election yet.'
                : 'No candidates registered for this specific office.'}
            </p>
            {!isReadOnly && (
              <Button size="sm" variant="outline" onClick={handleOpenCreate} className="mt-2 text-xs">
                + Register First Candidate
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((cand) => {
            const position = positions.find((p) => p.id === cand.positionId);
            return (
              <Card key={cand.id} className="hover:border-primary/40 transition-colors overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {cand.avatarUrl ? (
                      <img
                        src={cand.avatarUrl}
                        alt={cand.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-primary/20 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                        {cand.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <CardTitle className="text-base font-bold truncate">{cand.name}</CardTitle>
                        <Badge
                          variant={
                            cand.status === CandidateStatus.APPROVED
                              ? 'success'
                              : cand.status === CandidateStatus.PENDING
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {cand.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-primary mt-0.5">
                        {position ? position.title : 'Unassigned Office'}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Ballot Order #{cand.ballotOrder}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {cand.bio && (
                    <p className="text-muted-foreground line-clamp-2">
                      {cand.bio}
                    </p>
                  )}
                  {cand.manifesto && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-muted text-[11px] space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-foreground text-[11px]">
                        <FileText className="h-3 w-3 text-primary" /> Key Manifesto Pledge:
                      </div>
                      <p className="text-muted-foreground italic line-clamp-2">
                        "{cand.manifesto}"
                      </p>
                    </div>
                  )}

                  {!isReadOnly && (
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <button
                        onClick={() => handleToggleStatus(cand)}
                        className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                          cand.status === CandidateStatus.APPROVED
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        {cand.status === CandidateStatus.APPROVED ? (
                          <>
                            <XCircle className="h-3.5 w-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(cand)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit candidate profile"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cand.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete candidate"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-base font-bold">
              {editingCandidate ? 'Edit Candidate Profile' : 'Register New Candidate'}
            </h4>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Full Candidate Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Contested Office / Position *</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formPosId}
                  onChange={(e) => setFormPosId(e.target.value)}
                  required
                >
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Candidate Biography</label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Academic background, year, major, or experience..."
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Campaign Manifesto / Platform</label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
                  value={formManifesto}
                  onChange={(e) => setFormManifesto(e.target.value)}
                  placeholder="Key pledges, objectives, and policy platforms..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Avatar / Photo URL</label>
                  <Input
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Ballot Order Index</label>
                  <Input
                    type="number"
                    min="1"
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingCandidate ? 'Update Profile' : 'Register Candidate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
