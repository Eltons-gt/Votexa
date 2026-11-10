import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  ShieldCheck,
  RefreshCw,
  Clock,
  User,
  Globe,
  Radio
} from 'lucide-react';
import { SecurityEventRecord, SecurityEventSeverity } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function SuperAdminSecurityEvents() {
  const [events, setEvents] = useState<SecurityEventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const fetchSecurityEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = severityFilter
        ? `/admin/security-events?severity=${severityFilter}`
        : '/admin/security-events';
      const res = await apiClient.get<SecurityEventRecord[]>(url);
      if (res.success && res.data) {
        setEvents(res.data);
      } else {
        setError(res.error?.message || 'Failed to fetch security events');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with security service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, [severityFilter]);

  const criticalCount = events.filter((e) => e.severity === SecurityEventSeverity.CRITICAL).length;
  const highCount = events.filter((e) => e.severity === SecurityEventSeverity.HIGH).length;
  const mediumCount = events.filter((e) => e.severity === SecurityEventSeverity.MEDIUM).length;
  const lowCount = events.filter((e) => e.severity === SecurityEventSeverity.LOW).length;

  const getSeverityBadge = (sev: SecurityEventSeverity) => {
    switch (sev) {
      case SecurityEventSeverity.CRITICAL:
        return (
          <Badge variant="destructive" className="animate-pulse bg-red-600 text-white font-mono text-[10px]">
            CRITICAL
          </Badge>
        );
      case SecurityEventSeverity.HIGH:
        return (
          <Badge variant="destructive" className="bg-orange-600 text-white font-mono text-[10px]">
            HIGH
          </Badge>
        );
      case SecurityEventSeverity.MEDIUM:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 font-mono text-[10px]">
            MEDIUM
          </Badge>
        );
      case SecurityEventSeverity.LOW:
      default:
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500 font-mono text-[10px]">
            LOW
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            Security Operations & Intrusion Event Monitor
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time detection of privilege escalation, cross-tenant isolation breaches, and duty separation violations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSecurityEvents}
          disabled={loading}
          className="text-xs gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Critical Threats
            </CardTitle>
            <Flame className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-[11px] text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              High Severity
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{highCount}</div>
            <p className="text-[11px] text-muted-foreground">Privilege & policy alerts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Medium Severity
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{mediumCount}</div>
            <p className="text-[11px] text-muted-foreground">Suspicious patterns</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Low Severity
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{lowCount}</div>
            <p className="text-[11px] text-muted-foreground">Routine security notices</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 border-b pb-3">
        <span className="text-xs font-semibold text-muted-foreground">Filter by Severity:</span>
        <button
          onClick={() => setSeverityFilter('')}
          className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
            severityFilter === '' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({events.length})
        </button>
        <button
          onClick={() => setSeverityFilter(SecurityEventSeverity.CRITICAL)}
          className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
            severityFilter === SecurityEventSeverity.CRITICAL
              ? 'bg-red-600 text-white'
              : 'bg-muted text-muted-foreground hover:text-red-500'
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setSeverityFilter(SecurityEventSeverity.HIGH)}
          className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
            severityFilter === SecurityEventSeverity.HIGH
              ? 'bg-orange-500 text-white'
              : 'bg-muted text-muted-foreground hover:text-orange-500'
          }`}
        >
          High ({highCount})
        </button>
        <button
          onClick={() => setSeverityFilter(SecurityEventSeverity.MEDIUM)}
          className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
            severityFilter === SecurityEventSeverity.MEDIUM
              ? 'bg-amber-500 text-white'
              : 'bg-muted text-muted-foreground hover:text-amber-500'
          }`}
        >
          Medium ({mediumCount})
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2 border border-destructive/20">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Security Incidents Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              <span>Zero security incidents logged. Perimeter and tenant isolation intact.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="border rounded-md p-3.5 bg-card text-xs space-y-2 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(evt.severity)}
                      <span className="font-mono font-semibold text-foreground">{evt.eventType}</span>
                      {evt.organizationId && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Tenant: {evt.organizationId}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      {evt.actorEmail && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {evt.actorEmail}
                        </span>
                      )}
                      {evt.ipAddress && (
                        <span className="flex items-center gap-1 font-mono">
                          <Globe className="h-3 w-3" />
                          {evt.ipAddress}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-2.5 rounded text-[11px] font-mono border">
                    {typeof evt.details === 'object'
                      ? JSON.stringify(evt.details, null, 2)
                      : String(evt.details)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

