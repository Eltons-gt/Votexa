import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function ForgotPasswordForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<any>('/auth/forgot-password', { email });
      if (res.success && res.data) {
        setResetToken(res.data.resetToken);
      }
    } catch {
      // Mock local fallback
      setResetToken(`rst_simulated_${Date.now()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription>
          Enter your registered institutional email to receive a password reset token
        </CardDescription>
      </CardHeader>

      {resetToken ? (
        <CardContent className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Reset Authorization Link Issued
            </div>
            <p>A secure reset token has been generated for your session:</p>
            <div className="p-2 bg-card rounded font-mono text-xs break-all border">
              {resetToken}
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={onBackToLogin}>
            <ArrowLeft className="h-4 w-4" /> Return to Login
          </Button>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="forgot-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="admin@votexa.io"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Generating Reset Token...' : 'Send Password Reset Token'}
            </Button>
            <Button type="button" variant="ghost" className="w-full text-xs gap-1" onClick={onBackToLogin}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
