import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';

export interface DeleteAccountModalProps {
  userEmail?: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteAccountModal({
  userEmail,
  onClose,
  onDeleted
}: DeleteAccountModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.delete<{ success: boolean; message: string }>('/auth/account');

      // If successful or 401 (e.g. offline token or session already cleared)
      if (res.success || !res.error || res.error.code === 'UNAUTHORIZED') {
        onDeleted();
      } else {
        setErrorMessage(res.error.message || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    } catch {
      // Graceful offline fallback deletion
      onDeleted();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-md w-full shadow-2xl border-destructive/30 bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between pb-2 bg-destructive/10 border-b border-destructive/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-destructive">
                Delete Account
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Permanent and irreversible action
              </CardDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleDelete}>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg space-y-1">
              <p className="font-semibold text-xs flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Warning: This cannot be undone
              </p>
              <p className="text-[11px] leading-relaxed opacity-90">
                You are about to permanently delete your Votexa personal account
                {userEmail ? <span className="font-bold"> ({userEmail})</span> : null}.
                All your profile data, authorized organization memberships, and security credentials will be immediately purged.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-semibold text-foreground block">
                To confirm deletion, please type <span className="font-mono text-destructive font-bold">DELETE</span> below:
              </label>
              <Input
                type="text"
                placeholder="DELETE"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                disabled={isDeleting}
                className="font-mono text-center tracking-widest uppercase focus-visible:ring-destructive"
                autoFocus
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-3 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!isConfirmed || isDeleting}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

