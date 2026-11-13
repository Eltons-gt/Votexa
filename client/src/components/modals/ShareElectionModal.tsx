import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  X,
  QrCode,
  Globe,
  Radio,
  Send
} from 'lucide-react';
import { Election, ElectionStatus } from '@votexa/shared';

export interface ShareElectionModalProps {
  election: Election | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareElectionModal({
  election,
  isOpen,
  onClose
}: ShareElectionModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  useEffect(() => {
    if (!isOpen || !election) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://votexa-nu.vercel.app';
    const url = `${origin}/?vote=${election.id}`;
    setShareUrl(url);

    QRCode.toDataURL(url, {
      width: 340,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff'
      }
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [isOpen, election]);

  if (!isOpen || !election) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const safeTitle = election.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'vote';
    a.download = `${safeTitle}-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Cast your vote on: "${election.title}"\n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Cast your vote on "${election.title}"`)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-md w-full shadow-2xl border-primary/20 bg-card overflow-hidden">
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-border bg-muted/20">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-bold px-2 py-0.5">
                <Share2 className="h-3 w-3 mr-1" /> Share Ballot
              </Badge>
              {election.status === ElectionStatus.ACTIVE ? (
                <Badge variant="default" className="text-[10px] bg-emerald-600 hover:bg-emerald-600 text-white gap-1 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> Live Poll
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  {election.status}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base font-extrabold text-foreground line-clamp-1">
              {election.title}
            </CardTitle>
            <CardDescription className="text-xs">
              Anyone with this link or QR code can participate and cast their vote.
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        {/* Tab selection */}
        <div className="flex border-b border-border bg-muted/10">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'link'
                ? 'border-primary text-primary bg-background/50'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Vote Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-primary text-primary bg-background/50'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            QR Code
          </button>
        </div>

        <CardContent className="space-y-4 pt-4 text-xs">
          {/* TAB 1: DIRECT LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs block">
                  Public Voting URL
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="font-mono text-xs bg-muted/40 select-all"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    className={`gap-1.5 shrink-0 text-xs ${
                      copied ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''
                    }`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Quick Share to Audience:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold text-xs transition-colors"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    Twitter / X
                  </a>
                </div>
              </div>

              {/* Live Preview Button */}
              <div className="pt-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview Public Voter Screen &rarr;
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-white rounded-2xl border border-border max-w-[240px] mx-auto shadow-md">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${election.title}`}
                    className="w-full h-auto aspect-square object-contain"
                  />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-foreground text-xs">
                  Scan to vote with any smartphone camera
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Display this QR code on your podcast livestream, YouTube video, presentation slides, or printed flyers.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadQr}
                  disabled={!qrDataUrl}
                  className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code (PNG)
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end border-t pt-3 bg-muted/20">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
