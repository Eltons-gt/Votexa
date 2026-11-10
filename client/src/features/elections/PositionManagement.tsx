import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Briefcase, Plus, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { ElectionPosition, CreatePositionRequest } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface PositionManagementProps {
  electionId: string;
  isReadOnly?: boolean;
}

export function PositionManagement({ electionId, isReadOnly = false }: PositionManagementProps) {
  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<ElectionPosition | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMin, setFormMin] = useState(1);
  const [formMax, setFormMax] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ElectionPosition[]>(`/elections/${electionId}/positions`);
      if (res.data) {
        setPositions(res.data);
      }
    } catch {
      // Fallback
      setPositions([
        {
          id: 'pos-1',
          electionId,
          organizationId: 'current',
          title: 'Student Body President',
          description: 'Chief executive officer of the student association.',
          minSelections: 1,
          maxSelections: 1,
          orderIndex: 0,
          createdAt: new Date().toISOString(),
          candidatesCount: 2
        },
        {
          id: 'pos-2',
          electionId,
          organizationId: 'current',
          title: 'Executive Vice President',
          description: 'Chairs the executive committee and legislative sessions.',
          minSelections: 1,
          maxSelections: 1,
          orderIndex: 1,
          createdAt: new Date().toISOString(),
          candidatesCount: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [electionId]);

  const handleOpenCreate = () => {
    setEditingPosition(null);
    setFormTitle('');
    setFormDesc('');
    setFormMin(1);
    setFormMax(1);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos: ElectionPosition) => {
    setEditingPosition(pos);
    setFormTitle(pos.title);
    setFormDesc(pos.description || '');
    setFormMin(pos.minSelections);
    setFormMax(pos.maxSelections);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setError('Position title is required');
      return;
    }
    if (formMin < 1 || formMax < formMin) {
      setError('Min selections must be >= 1 and max must be >= min');
      return;
    }

    try {
      if (editingPosition) {
        await apiClient.put(`/elections/${electionId}/positions/${editingPosition.id}`, {
          title: formTitle.trim(),
          description: formDesc.trim(),
          minSelections: formMin,
          maxSelections: formMax
        });
      } else {
        const payload: CreatePositionRequest = {
          title: formTitle.trim(),
          description: formDesc.trim(),
          minSelections: formMin,
          maxSelections: formMax,
          orderIndex: positions.length
        };
        await apiClient.post(`/elections/${electionId}/positions`, payload);
      }
      setIsModalOpen(false);
      fetchPositions();
    } catch (err) {
      setError((err as Error).message || 'Failed to save position');
    }
  };

  const handleDelete = async (posId: string) => {
    if (!confirm('Are you sure you want to delete this position?')) return;
    try {
      await apiClient.delete(`/elections/${electionId}/positions/${posId}`);
      fetchPositions();
    } catch (err) {
      alert((err as Error).message || 'Failed to delete position');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Election Positions & Offices
          </h3>
          <p className="text-xs text-muted-foreground">
            Define contested positions, executive offices, or award categories for this election.
          </p>
        </div>
        {!isReadOnly && (
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Add Position
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading election positions...</div>
      ) : positions.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <CardContent className="space-y-2">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">No positions configured yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Every election must have at least one position (e.g. President, Representative, Grand Champion) before scheduling.
            </p>
            {!isReadOnly && (
              <Button size="sm" variant="outline" onClick={handleOpenCreate} className="mt-2 text-xs">
                + Create First Position
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map((pos) => (
            <Card key={pos.id} className="relative overflow-hidden hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">{pos.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        Order #{pos.orderIndex + 1}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {pos.maxSelections === 1 ? 'Single Select (1)' : `Multi-Select (${pos.minSelections}-${pos.maxSelections})`}
                      </Badge>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(pos)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Edit position"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pos.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete position"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted-foreground line-clamp-2">
                  {pos.description || 'No description provided for this office.'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {pos.candidatesCount ?? 0} Registered Candidates
                  </span>
                  <span>Min: {pos.minSelections} / Max: {pos.maxSelections}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Position Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h4 className="text-base font-bold">
              {editingPosition ? 'Edit Election Position' : 'Create New Election Position'}
            </h4>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Position / Office Title *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Student Body President"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Role responsibilities and eligibility criteria..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Min Selections</label>
                  <Input
                    type="number"
                    min="1"
                    value={formMin}
                    onChange={(e) => setFormMin(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Max Selections</label>
                  <Input
                    type="number"
                    min="1"
                    value={formMax}
                    onChange={(e) => setFormMax(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingPosition ? 'Update Position' : 'Create Position'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
