'use client';

import { useState } from 'react';
import {
  FileText,
  Activity,
  Brain,
  FlaskConical,
  Stethoscope,
  Pill,
  ArrowRightLeft,
  HeartPulse,
  Globe,
  Download,
  Loader2,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks/redux';
import { downloadReportRequest } from '@/app/source/StatsSource';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';

interface ReportDef {
  type: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  formats: ('pdf' | 'csv')[];
  requiresOutreach: boolean;
}

const REPORTS: ReportDef[] = [
  {
    type: 'summary',
    title: 'Summary Report',
    description: 'High-level overview of patients seen, queue stats, disease burden, and service coverage for an outreach.',
    icon: FileText,
    color: 'from-blue-500/10 to-blue-600/5',
    iconBg: 'bg-blue-500/10 text-blue-600',
    formats: ['pdf'],
    requiresOutreach: true,
  },
  {
    type: 'disease',
    title: 'Disease Report',
    description: 'Top diagnoses with gender cross-tabulation and distribution across age groups.',
    icon: Activity,
    color: 'from-emerald-500/10 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    formats: ['pdf', 'csv'],
    requiresOutreach: true,
  },
  {
    type: 'mental-health',
    title: 'Mental Health Report',
    description: 'PHQ-9 and GAD-7 screening results by severity level, referral rates, and coverage percentage.',
    icon: Brain,
    color: 'from-purple-500/10 to-purple-600/5',
    iconBg: 'bg-purple-500/10 text-purple-600',
    formats: ['pdf'],
    requiresOutreach: true,
  },
  {
    type: 'labs',
    title: 'Lab Results Report',
    description: 'Laboratory test counts, positivity rates by test type, and abnormal result breakdown.',
    icon: FlaskConical,
    color: 'from-amber-500/10 to-amber-600/5',
    iconBg: 'bg-amber-500/10 text-amber-600',
    formats: ['pdf', 'csv'],
    requiresOutreach: true,
  },
  {
    type: 'doctors',
    title: 'Doctor Performance Report',
    description: 'Per-doctor consultation counts, average consultation time, follow-up rates, and transfers initiated.',
    icon: Stethoscope,
    color: 'from-cyan-500/10 to-cyan-600/5',
    iconBg: 'bg-cyan-500/10 text-cyan-600',
    formats: ['pdf'],
    requiresOutreach: true,
  },
  {
    type: 'pharmacy',
    title: 'Pharmacy Report',
    description: 'Dispensing summary, top medications by volume, stock levels, and low/out-of-stock alerts.',
    icon: Pill,
    color: 'from-rose-500/10 to-rose-600/5',
    iconBg: 'bg-rose-500/10 text-rose-600',
    formats: ['pdf', 'csv'],
    requiresOutreach: true,
  },
  {
    type: 'transfers',
    title: 'Transfers Report',
    description: 'All patient transfers with reason, destination facility, and initiating staff member.',
    icon: ArrowRightLeft,
    color: 'from-orange-500/10 to-orange-600/5',
    iconBg: 'bg-orange-500/10 text-orange-600',
    formats: ['csv'],
    requiresOutreach: true,
  },
  {
    type: 'vitals',
    title: 'Vitals Report',
    description: 'Hypertension prevalence, BMI distribution, blood glucose, oxygen saturation, and fever rates.',
    icon: HeartPulse,
    color: 'from-red-500/10 to-red-600/5',
    iconBg: 'bg-red-500/10 text-red-600',
    formats: ['pdf'],
    requiresOutreach: true,
  },
  {
    type: 'impact',
    title: 'Impact Report',
    description: 'Per-outreach community impact: patient demographics, BMI and chronic disease analysis, doctor and team performance, and pharmacy dispensing.',
    icon: Globe,
    color: 'from-indigo-500/10 to-indigo-600/5',
    iconBg: 'bg-indigo-500/10 text-indigo-600',
    formats: ['pdf'],
    requiresOutreach: true,
  },
];

function ReportCard({
  report,
  outreachId,
  startDate,
  endDate,
}: {
  report: ReportDef;
  outreachId: string | null;
  startDate?: string;
  endDate?: string;
}) {
  const [downloading, setDownloading] = useState<'pdf' | 'csv' | null>(null);
  const Icon = report.icon;

  const handleDownload = async (format: 'pdf' | 'csv') => {
    if (report.requiresOutreach && !outreachId) {
      toast.error('No active outreach selected. Please select an outreach first.');
      return;
    }

    setDownloading(format);
    try {
      const buffer = await downloadReportRequest(
        report.type,
        format,
        report.requiresOutreach ? (outreachId ?? undefined) : undefined,
        startDate || undefined,
        endDate || undefined,
      );
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const blob = new Blob([buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${report.title} downloaded.`);
    } catch {
      toast.error(`Failed to download ${report.title}.`);
    } finally {
      setDownloading(null);
    }
  };

  const isDisabled = report.requiresOutreach && !outreachId;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${report.color} bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${report.iconBg} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{report.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{report.description}</p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {report.formats.map((fmt) => (
              <Badge
                key={fmt}
                variant="outline"
                className="text-xs font-mono uppercase"
              >
                {fmt}
              </Badge>
            ))}
          </div>

          {isDisabled && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Select an outreach to enable this report.
            </p>
          )}

          <div className="mt-4 flex gap-2 flex-wrap">
            {report.formats.map((fmt) => (
              <Button
                key={fmt}
                size="sm"
                variant={fmt === 'pdf' ? 'default' : 'outline'}
                disabled={isDisabled || downloading !== null}
                onClick={() => handleDownload(fmt)}
                className="gap-1.5"
              >
                {downloading === fmt ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsScreen() {
  const { activeOutreachId, activeOutreach } = useAppSelector(
    (state) => state.outreachContext,
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Download PDF or CSV reports for the active outreach. Optionally filter by date range.
        </p>
      </div>

      {activeOutreach ? (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          Active outreach: <span className="font-medium">{activeOutreach.name}</span>
          <span className="text-muted-foreground">— {activeOutreach.location}</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          No active outreach selected. All reports require an outreach.
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Date range:</span>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40 h-8 text-sm"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40 h-8 text-sm"
        />
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={() => { setStartDate(''); setEndDate(''); }}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <ReportCard
            key={report.type}
            report={report}
            outreachId={activeOutreachId}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic">
        All reports are confidential and intended for internal use only.
        Generated at time of download.
      </p>
    </div>
  );
}
