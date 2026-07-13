/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  Stethoscope,
  FlaskConical,
  Pill,
  Ambulance,
  Brain,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { fetchPatientRequest } from '@/app/source/PatientsSource';
import { fetchVitalSignsRequest } from '@/app/source/VitalSignsSource';
import { fetchObservationsRequest } from '@/app/source/ObservationsSource';
import { fetchLabResultsRequest } from '@/app/source/LabResultsSource';
import { fetchPrescriptionsRequest } from '@/app/source/PrescriptionsSource';
import { fetchTransfersRequest } from '@/app/source/TransfersSource';
import { fetchPHQ9ScreeningsRequest } from '@/app/source/PHQ9ScreeningsSource';
import { fetchGAD7ScreeningsRequest } from '@/app/source/GAD7ScreeningsSource';
import { fetchPCL5ScreeningsRequest } from '@/app/source/PCL5ScreeningsSource';
import { downloadPatientHistoryReportRequest } from '@/app/source/StatsSource';

function fmt(d: unknown) {
  if (!d) return '—';
  return new Date(d as string).toLocaleDateString();
}

function SectionCard({
  title,
  icon: Icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: any;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
        <Badge variant="secondary" className="rounded-full text-xs h-5 px-2">
          {count}
        </Badge>
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{empty}</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </section>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-4 py-2.5 text-left font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-border/40 hover:bg-muted/20">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-2.5 text-muted-foreground">
                {cell ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PatientHistoryScreen({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const [patient, setPatient] = useState<any>(null);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [phq9, setPhq9] = useState<any[]>([]);
  const [gad7, setGad7] = useState<any[]>([]);
  const [pcl5, setPcl5] = useState<any[]>([]);

  useEffect(() => {
    const params = { patientId, limit: 100 };
    Promise.all([
      fetchPatientRequest(patientId),
      fetchVitalSignsRequest(params),
      fetchObservationsRequest(params),
      fetchLabResultsRequest(params),
      fetchPrescriptionsRequest(params),
      fetchTransfersRequest(params),
      fetchPHQ9ScreeningsRequest(params),
      fetchGAD7ScreeningsRequest(params),
      fetchPCL5ScreeningsRequest(params),
    ])
      .then(([pat, vs, obs, labs, rx, tx, p9, g7, p5]) => {
        setPatient(pat);
        setVitalSigns((vs as any)?.items ?? []);
        setObservations((obs as any)?.items ?? []);
        setLabResults((labs as any)?.items ?? []);
        setPrescriptions((rx as any)?.items ?? []);
        setTransfers((tx as any)?.items ?? []);
        setPhq9((p9 as any)?.items ?? []);
        setGad7((g7 as any)?.items ?? []);
        setPcl5((p5 as any)?.items ?? []);
      })
      .catch(() => toast.error('Failed to load patient history'))
      .finally(() => setIsLoading(false));
  }, [patientId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const buffer = await downloadPatientHistoryReportRequest(patientId);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-history-${patientId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const patientName = patient
    ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim()
    : 'Unknown Patient';

  const location = [patient?.sector, patient?.district, patient?.province]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => router.push('/patients')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{patientName}</h2>
            <p className="text-sm text-muted-foreground">
              {patient?.registrationNumber && (
                <span className="font-mono mr-2">{patient.registrationNumber}</span>
              )}
              {location}
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-xl shadow-sm"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>
      </div>

      {/* Demographics card */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: 'Date of Birth', value: fmt(patient?.dateOfBirth) },
          { label: 'Gender', value: patient?.gender ?? '—' },
          { label: 'National ID', value: patient?.nationalId ?? '—' },
          { label: 'Phone', value: patient?.phoneNumber ?? '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Vital Signs */}
      <SectionCard
        title="Vital Signs"
        icon={Activity}
        count={vitalSigns.length}
        empty="No vital signs recorded."
      >
        <DataTable
          headers={['Date', 'BP', 'Pulse', 'Temp (°C)', 'Weight (kg)', 'Height (cm)', 'BMI', 'SpO₂ %']}
          rows={vitalSigns.map((v) => [
            fmt(v.createdAt),
            v.bloodPressureSystolic != null
              ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`
              : '—',
            v.pulseRate ?? '—',
            v.temperature ?? '—',
            v.weight ?? '—',
            v.height ?? '—',
            v.bmi ?? '—',
            v.oxygenSaturation ?? '—',
          ])}
        />
      </SectionCard>

      {/* Observations */}
      <SectionCard
        title="Observations & Diagnoses"
        icon={Stethoscope}
        count={observations.length}
        empty="No observations recorded."
      >
        <DataTable
          headers={['Date', 'Chief Complaint', 'Diagnosis', 'Treatment']}
          rows={observations.map((o) => [
            fmt(o.createdAt),
            o.chiefComplaint ?? '—',
            o.diagnosis ?? '—',
            o.treatmentGiven ?? '—',
          ])}
        />
      </SectionCard>

      {/* Lab Results */}
      <SectionCard
        title="Lab Results"
        icon={FlaskConical}
        count={labResults.length}
        empty="No lab results recorded."
      >
        <DataTable
          headers={['Date', 'Test', 'Result', 'Unit', 'Abnormal']}
          rows={labResults.map((l) => [
            fmt(l.createdAt),
            l.testType ?? '—',
            l.resultValue ?? '—',
            l.resultUnit ?? '—',
            l.isAbnormal ? (
              <Badge
                key="ab"
                variant="secondary"
                className="bg-red-500/10 text-red-600 border-red-500/20 text-xs"
              >
                YES
              </Badge>
            ) : (
              'No'
            ),
          ])}
        />
      </SectionCard>

      {/* Prescriptions */}
      <SectionCard
        title="Prescriptions"
        icon={Pill}
        count={prescriptions.length}
        empty="No prescriptions recorded."
      >
        <DataTable
          headers={['Date', 'Medication', 'Dosage', 'Qty', 'Status']}
          rows={prescriptions.map((rx) => [
            fmt(rx.createdAt),
            rx.customMedicationName ?? rx.pharmacyStock?.medicationName ?? '—',
            rx.dosage ?? '—',
            rx.quantity,
            rx.status ?? '—',
          ])}
        />
      </SectionCard>

      {/* Transfers */}
      <SectionCard
        title="Transfers & Referrals"
        icon={Ambulance}
        count={transfers.length}
        empty="No transfers recorded."
      >
        <DataTable
          headers={['Date', 'Facility', 'Service', 'Urgency', 'Reason']}
          rows={transfers.map((t) => [
            fmt(t.createdAt),
            t.referredToFacility ?? '—',
            t.referredService ?? '—',
            t.urgency ?? '—',
            t.transferReason ?? '—',
          ])}
        />
      </SectionCard>

      {/* Mental Health */}
      <SectionCard
        title="Mental Health Screenings"
        icon={Brain}
        count={phq9.length + gad7.length + pcl5.length}
        empty="No mental health screenings recorded."
      >
        {(phq9.length > 0 || gad7.length > 0 || pcl5.length > 0) && (
          <div className="divide-y divide-border/40">
            {phq9.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  PHQ-9 (Depression) — {phq9.length} record{phq9.length !== 1 ? 's' : ''}
                </p>
                <DataTable
                  headers={['Date', 'Score', 'Severity']}
                  rows={phq9.map((s) => [fmt(s.createdAt), s.totalScore, s.severity])}
                />
              </div>
            )}
            {gad7.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  GAD-7 (Anxiety) — {gad7.length} record{gad7.length !== 1 ? 's' : ''}
                </p>
                <DataTable
                  headers={['Date', 'Score', 'Severity']}
                  rows={gad7.map((s) => [fmt(s.createdAt), s.totalScore, s.severity])}
                />
              </div>
            )}
            {pcl5.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  PCL-5 (PTSD) — {pcl5.length} record{pcl5.length !== 1 ? 's' : ''}
                </p>
                <DataTable
                  headers={['Date', 'Score', 'Severity']}
                  rows={pcl5.map((s) => [fmt(s.createdAt), s.totalScore, s.severity])}
                />
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
