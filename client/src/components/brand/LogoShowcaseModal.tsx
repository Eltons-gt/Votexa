import { useState } from 'react';
import { VotexaLogo, LogoVariant } from './VotexaLogo';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Check, Sparkles, X, Sun, Moon } from 'lucide-react';

interface LogoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVariant: LogoVariant;
  onSelectVariant: (v: LogoVariant) => void;
}

export function LogoShowcaseModal({
  isOpen,
  onClose,
  selectedVariant,
  onSelectVariant
}: LogoShowcaseModalProps) {
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  if (!isOpen) return null;

  const logoOptions: Array<{
    id: LogoVariant;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    badgeColor: string;
  }> = [
    {
      id: 'geometric-v',
      title: 'Option 1: The Civic Monogram',
      subtitle: 'The Geometric V-Check Mark',
      description:
        'A precision geometric mark where the letter "V" and an ascending checkmark intersect. Clean, minimalist, and tech-forward, matching modern SaaS aesthetics like Stripe and Linear.',
      badge: 'Modern & Clean',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      id: 'shield-check',
      title: 'Option 2: The Trust Shield',
      subtitle: 'Cryptographic Security & Ballot',
      description:
        'A sleek security shield with an integrated voting ballot slot and golden checkmark. Emphasizes enterprise trust, tamper-evident cryptographic tallying, and institutional integrity.',
      badge: 'Security & Trust',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    {
      id: 'dynamic-bars',
      title: 'Option 3: The Dynamic Pulse',
      subtitle: 'Ascending Tally Bars & Victory Podium',
      description:
        'Three ascending rounded tally bars that form a dynamic "V" silhouette and victory podium. Highlights real-time results, high-engagement competitions, and democratic momentum.',
      badge: 'Dynamic & Vibrant',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-foreground">Votexa Brand Identity — 3 Logo Samples</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select your preferred logo mark to apply it across the platform navigation, landing page, and authentication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5"
              title="Toggle preview background"
            >
              {previewTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              <span className="hidden sm:inline capitalize">{previewTheme} Preview</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3 Logo Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {logoOptions.map((opt) => {
            const isSelected = selectedVariant === opt.id;
            return (
              <Card
                key={opt.id}
                onClick={() => onSelectVariant(opt.id)}
                className={`cursor-pointer transition-all border-2 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
              >
                {/* Visual Canvas Box */}
                <div
                  className={`p-8 flex flex-col items-center justify-center gap-4 min-h-[160px] border-b transition-colors ${
                    previewTheme === 'dark'
                      ? 'bg-slate-950 text-white border-slate-800'
                      : 'bg-white text-slate-900 border-slate-100'
                  }`}
                >
                  <VotexaLogo
                    variant={opt.id}
                    size="lg"
                    showWordmark={true}
                    wordmarkClassName={previewTheme === 'dark' ? 'text-white' : 'text-slate-950'}
                  />
                  {/* Small / Icon only preview */}
                  <div className="flex items-center gap-3 pt-2 opacity-80">
                    <span className="text-[10px] text-muted-foreground font-mono">App Icon:</span>
                    <div className="p-1 rounded-lg bg-card/10 border border-current/10">
                      <VotexaLogo variant={opt.id} size="sm" showWordmark={false} />
                    </div>
                  </div>
                </div>

                {/* Information & Action */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-xs font-bold text-primary">
                          <Check className="h-4 w-4" /> Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-foreground">{opt.title}</h3>
                    <p className="text-xs font-medium text-primary/90">{opt.subtitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                  </div>

                  <Button
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="w-full gap-1.5 font-bold text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVariant(opt.id);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Selected Logo
                      </>
                    ) : (
                      'Choose This Design'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            Current Active Brand: <strong className="text-foreground capitalize">{selectedVariant.replace('-', ' ')}</strong>
          </span>
          <Button onClick={onClose} size="sm">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
