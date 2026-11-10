import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Building2, Globe, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function OrganizationOnboarding({
  onCreated,
  onCancel
}: {
  onCreated: (newMembership: any) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post<any>('/organizations', {
        name: name.trim(),
        slug: slug.trim().toLowerCase()
      });

      if (res.success && res.data) {
        onCreated(res.data);
      } else {
        setErrorMessage(res.error?.message || 'Failed to create organization.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error onboarding organization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto shadow-lg border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
          <Building2 className="h-4 w-4" /> Multi-Tenant Workspace Onboarding
        </div>
        <CardTitle className="text-xl">Create a New Organization</CardTitle>
        <CardDescription>
          Establish an isolated, private workspace for your university, faculty, or corporate board.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="org-name">
              Organization Name
            </label>
            <Input
              id="org-name"
              placeholder="e.g. Oxford Academic Council"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="org-slug">
              Workspace URL Slug
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="org-slug"
                placeholder="oxford-academic-council"
                className="pl-9 font-mono text-xs"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Workspace URL: <span className="text-primary font-bold">https://votexa.io/{slug || 'your-slug'}</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Button>
          )}
          <Button type="submit" size="sm" className="ml-auto" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Creating Workspace...' : 'Create Organization Workspace'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

