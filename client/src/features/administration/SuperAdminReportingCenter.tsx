import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  FileText,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Table as TableIcon
} from 'lucide-react';
import { ReportType, GeneratedReportResponse } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function SuperAdminReportingCenter() {
  const [reportType, setReportType] = useState<ReportType>(ReportType.ELECTION_PARTICIPATION);
  const [organizationId, setOrganizationId] = useState('');
  const [electionId, setElectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<GeneratedReportResponse | null>(null);

  const reportOptions: { value: ReportType; label: string; description: string }[] = [
    {
      value: ReportType.ELECTION_PARTICIPATION,
      label: 'Election Participation Report',
      description: 'Positions, registered candidates, and cast ballot metrics'
    },
    {
      value: ReportType.CANDIDATE_VOTE_SUMMARY,
      label: 'Candidate Vote Summary',
      description: 'Total votes won and rank order per candidate'
    },
    {
      value: ReportType.VOTER_TURNOUT,
      label: 'Voter Turnout Report',
      description: 'Eligible voters vs actual voters with turnout percentages'
    },
    {
      value: ReportType.PAYMENT_TRANSACTIONS,
      label: 'Payment Transactions Report',
      description: 'M-Pesa STK push and gateway transactions with M-Pesa receipt IDs'
    },
    {
      value: ReportType.PLATFORM_COMMISSIONS,
      label: 'Platform Commission Report',
      description: 'Platform 40% vs Organiser 60% revenue split reconciliation'
    },
    {
      value: ReportType.ORGANISER_EARNINGS,
      label: 'Organiser Earnings Report',
      description: 'Gross sales, 60% organiser net earnings, and available treasury balances'
    },
    {
      value: ReportType.PAYOUTS,
      label: 'Withdrawal & Payouts Report',
      description: 'Requested, approved, processing, and settled disbursements with B2C evidence'
    },
    {
      value: ReportType.REFUNDS,
      label: 'Refunds & Reversals Report',
      description: 'Full and partial refund disbursements and balance restorations'
    },
    {
      value: ReportType.FINANCIAL_RECONCILIATION,
      label: 'Financial Reconciliation Report',
      description: 'Platform-wide double-entry ledger verification and balance checks'
    }
  ];

  const handleGenerate = async (exportCsv: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        reportType,
        organizationId: organizationId.trim() || undefined,
        electionId: electionId.trim() || undefined,
        format: exportCsv ? 'csv' : 'json'
      };

      const res = await apiClient.post<GeneratedReportResponse>('/admin/reports', payload);
      if (res.success && res.data) {
        setReportResult(res.data);
        if (exportCsv && res.data.csvContent) {
          // Trigger browser CSV file download
          const blob = new Blob([res.data.csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${reportType.toLowerCase()}_report_${Date.now()}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setError(res.error?.message || 'Failed to generate report');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while generating report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Platform Reporting System & Data Exporter
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate verifiable analytical, participation, and financial reconciliation reports in JSON or RFC 4180 CSV format.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-xs self-start sm:self-auto border-primary/30 text-primary">
          9 Enterprise Report Types
        </Badge>
      </div>

      {/* Report Configuration Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Report Generator Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Select Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {reportOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                {reportOptions.find((o) => o.value === reportType)?.description}
              </p>
            </div>

            {/* Organization Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Organization Scope <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. org-metro-uni or blank for all"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">Leave blank to aggregate across all platform tenants.</p>
            </div>

            {/* Election Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Election ID <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. elec-metro-1"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">Optional filter for election-specific summaries.</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2 border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="gap-1.5 text-xs h-9"
            >
              <TableIcon className="h-3.5 w-3.5" />
              {loading ? 'Compiling Report...' : 'Generate Preview'}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleGenerate(true)}
              disabled={loading}
              className="gap-1.5 text-xs h-9 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Download className="h-3.5 w-3.5" />
              Export to RFC 4180 CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Results */}
      {reportResult && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {reportOptions.find((o) => o.value === reportResult.reportType)?.label || reportResult.reportType}
              </CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Generated: {new Date(reportResult.generatedAt).toLocaleString()}
                </span>
                <span>•</span>
                <span>Records: <strong>{reportResult.rowCount}</strong></span>
                <span>•</span>
                <span>Scope: <strong>{reportResult.organizationScope || 'ALL_TENANTS'}</strong></span>
              </div>
            </div>

            {reportResult.csvContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([reportResult.csvContent!], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', `${reportResult.reportType.toLowerCase()}_report.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="gap-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Download CSV
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {reportResult.data.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No matching records found for the selected scope.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      {Object.keys(reportResult.data[0] || {}).map((colKey) => (
                        <th key={colKey} className="px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">
                          {colKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportResult.data.slice(0, 50).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        {Object.values(row).map((val: any, colIdx: number) => (
                          <td key={colIdx} className="px-3 py-2 whitespace-nowrap text-foreground font-mono text-[11px]">
                            {typeof val === 'boolean'
                              ? val ? 'TRUE' : 'FALSE'
                              : typeof val === 'object' && val !== null
                              ? JSON.stringify(val)
                              : String(val ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportResult.data.length > 50 && (
                  <div className="p-2 text-center text-[11px] text-muted-foreground bg-muted/30 border-t">
                    Showing first 50 of {reportResult.data.length} records. Export full report as CSV for entire dataset.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
