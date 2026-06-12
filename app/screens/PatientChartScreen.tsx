/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
  Plus,
  Pencil,
  Activity,
  Stethoscope,
  FlaskConical,
  AlertTriangle,
  Ambulance,
  RefreshCw,
  Pill,
  MessageSquareText,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import {
  fetchPatientChart,
  updateQueueStatus,
} from '@/app/store/queue-entries';
import { createVitalSign, updateVitalSign } from '@/app/store/vital-signs';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';
import { VitalSignModal } from '@/app/components/modals/VitalSignModal';
import { ObservationModal } from '@/app/components/modals/ObservationModal';
import { LabResultModal } from '@/app/components/modals/LabResultModal';
import { CommunicableDiseaseModal } from '@/app/components/modals/CommunicableDiseaseModal';
import { TransferModal } from '@/app/components/modals/TransferModal';
import { MovePatientModal } from '@/app/components/modals/MovePatientModal';
import { PrescriptionModal } from '@/app/components/modals/PrescriptionModal';
import { DispenseConfirmModal } from '@/app/components/modals/DispenseConfirmModal';
import { dispensePrescription } from '@/app/store/prescriptions';
import { fetchPHQ9Screenings } from '@/app/store/phq9-screenings';
import { fetchGAD7Screenings } from '@/app/store/gad7-screenings';
import { fetchPCL5Screenings } from '@/app/store/pcl5-screenings';
import { MentalHealthScreeningModal } from '@/app/components/modals/MentalHealthScreeningModal';
import { PHQ9Screening } from '@/app/store/phq9-screenings/phq9-screenings.types';
import { GAD7Screening } from '@/app/store/gad7-screenings/gad7-screenings.types';
import { PCL5Screening } from '@/app/store/pcl5-screenings/pcl5-screenings.types';
import { Brain } from 'lucide-react';
import {
  QueueEntry,
  QueuePriority,
  QueueStatus,
  PrescriptionRecord,
  VitalSignRecord,
  ObservationRecord,
  LabResultRecord,
  CommunicableDiseaseRecord,
  TransferRecord,
} from '@/app/store/queue-entries/queue-entries.types';

const PRIORITY_CONFIG: Record<
  QueuePriority,
  { label: string; className: string }
> = {
  EMERGENCY: {
    label: 'Emergency',
    className: 'bg-red-500/10 text-red-600 border-red-500/30',
  },
  URGENT: {
    label: 'Urgent',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  NORMAL: {
    label: 'Normal',
    className: 'bg-slate-100 text-slate-600 border-slate-300',
  },
};

const STATUS_CONFIG: Record<
  QueueStatus,
  { label: string; icon: any; className: string }
> = {
  WAITING: {
    label: 'Waiting',
    icon: Clock,
    className: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  },
  IN_SERVICE: {
    label: 'In Service',
    icon: Play,
    className: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'text-green-600 bg-green-500/10 border-green-500/30',
  },
  NO_SHOW: {
    label: 'No Show',
    icon: XCircle,
    className: 'text-slate-400 bg-slate-100 border-slate-300',
  },
};

function waitTime(createdAt: string) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function age(dob?: string) {
  if (!dob) return null;
  const years = Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
  return `${years} yrs`;
}

function SectionCard({
  title,
  icon: Icon,
  count,
  onAdd,
  canCreate,
  empty,
  children,
}: {
  title: string;
  icon: any;
  count: number;
  onAdd?: () => void;
  canCreate?: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{title}</span>
          <Badge variant="secondary" className="rounded-full text-xs h-5 px-2">
            {count}
          </Badge>
        </div>
        {onAdd && (
          <Can do="create" on={canCreate as any}>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5 h-10 px-3 touch-manipulation"
              onClick={onAdd}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </Can>
        )}
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {empty}
        </p>
      ) : (
        <div>{children}</div>
      )}
    </section>
  );
}

function MobileRecordCard({
  children,
  onEdit,
  canEdit,
}: {
  children: React.ReactNode;
  onEdit?: () => void;
  canEdit?: string;
}) {
  return (
    <article className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
      {children}
      {onEdit && canEdit && (
        <Can do="update" on={canEdit as any}>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-11 w-full rounded-xl gap-2 touch-manipulation"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" /> Edit record
          </Button>
        </Can>
      )}
    </article>
  );
}

function MobileField({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 break-words text-sm text-foreground">{children}</div>
    </div>
  );
}

const MH_SEVERITY_STYLE: Record<string, string> = {
  NONE: 'bg-green-500/10 text-green-600 border-green-500/30',
  MINIMAL: 'bg-green-500/10 text-green-600 border-green-500/30',
  MILD: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  MODERATE: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  MOD_SEVERE: 'bg-red-500/10 text-red-600 border-red-500/30',
  SEVERE: 'bg-red-500/10 text-red-600 border-red-500/30',
  EXTREME: 'bg-red-500/10 text-red-600 border-red-500/30',
};

function MHSeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge className={`text-xs ${MH_SEVERITY_STYLE[severity] ?? ''}`}>
      {severity.replace('_', ' ')}
    </Badge>
  );
}

interface Props {
  entryId: string;
}

export default function PatientChartScreen({ entryId }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { chart, isLoadingChart } = useAppSelector((s) => s.queueEntries);

  const [vitalModal, setVitalModal] = useState(false);
  const [obsModal, setObsModal] = useState(false);
  const [labModal, setLabModal] = useState(false);
  const [cdModal, setCdModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [rxModal, setRxModal] = useState(false);

  const [dispenseTarget, setDispenseTarget] =
    useState<PrescriptionRecord | null>(null);
  const [editingVital, setEditingVital] = useState<VitalSignRecord | null>(
    null,
  );
  const [editingObs, setEditingObs] = useState<ObservationRecord | null>(null);
  const [editingLab, setEditingLab] = useState<LabResultRecord | null>(null);
  const [editingCd, setEditingCd] = useState<CommunicableDiseaseRecord | null>(
    null,
  );
  const [editingTransfer, setEditingTransfer] = useState<TransferRecord | null>(
    null,
  );

  const [mhModal, setMhModal] = useState(false);
  const [editingMH, setEditingMH] = useState<{
    phq9: PHQ9Screening;
    gad7: GAD7Screening;
    pcl5?: PCL5Screening;
  } | null>(null);
  const [phq9List, setPhq9List] = useState<PHQ9Screening[]>([]);
  const [gad7List, setGad7List] = useState<GAD7Screening[]>([]);
  const [pcl5List, setPcl5List] = useState<PCL5Screening[]>([]);

  const openEdit = {
    vital: (r: VitalSignRecord) => {
      setEditingVital(r);
      setVitalModal(true);
    },
    obs: (r: ObservationRecord) => {
      setEditingObs(r);
      setObsModal(true);
    },
    lab: (r: LabResultRecord) => {
      setEditingLab(r);
      setLabModal(true);
    },
    cd: (r: CommunicableDiseaseRecord) => {
      setEditingCd(r);
      setCdModal(true);
    },
    transfer: (r: TransferRecord) => {
      setEditingTransfer(r);
      setTransferModal(true);
    },
  };

  const closeModal = {
    vital: () => {
      setVitalModal(false);
      setEditingVital(null);
    },
    obs: () => {
      setObsModal(false);
      setEditingObs(null);
    },
    lab: () => {
      setLabModal(false);
      setEditingLab(null);
    },
    cd: () => {
      setCdModal(false);
      setEditingCd(null);
    },
    transfer: () => {
      setTransferModal(false);
      setEditingTransfer(null);
    },
  };

  const load = () => {
    dispatch(fetchPatientChart(entryId));
    const params = { queueEntryId: entryId, limit: 100 };
    Promise.all([
      dispatch(fetchPHQ9Screenings(params))
        .unwrap()
        .catch(() => ({ items: [] })),
      dispatch(fetchGAD7Screenings(params))
        .unwrap()
        .catch(() => ({ items: [] })),
      dispatch(fetchPCL5Screenings(params))
        .unwrap()
        .catch(() => ({ items: [] })),
    ]).then(([p, g, c]) => {
      setPhq9List(p?.items ?? []);
      setGad7List(g?.items ?? []);
      setPcl5List(c?.items ?? []);
    });
  };

  useEffect(() => {
    load();
  }, [entryId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoadingChart || !chart) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        {isLoadingChart ? 'Loading patient chart…' : 'Chart not found.'}
      </div>
    );
  }

  const {
    entry,
    vitalSigns,
    observations,
    labResults,
    communicableDiseases,
    transfers,
    prescriptions = [],
  } = chart;
  const patient = entry.patient;
  const latestVitalNote = vitalSigns.find((v) => v.notes?.trim());
  const stat = STATUS_CONFIG[entry.status];
  const StatIcon = stat.icon;
  const prio = PRIORITY_CONFIG[entry.priority];
  const initials =
    `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
  const patientAgeYears = patient.dateOfBirth
    ? Math.floor(
        new Date().getFullYear() -
          new Date(patient.dateOfBirth).getFullYear() -
          (new Date() <
          new Date(
            new Date(patient.dateOfBirth).setFullYear(new Date().getFullYear()),
          )
            ? 1
            : 0),
      )
    : 99;

  const handleStatus = async (status: QueueStatus) => {
    try {
      await dispatch(
        updateQueueStatus({ id: entry.id, data: { status } }),
      ).unwrap();
      toast.success(
        status === 'COMPLETED'
          ? 'Visit completed'
          : status === 'NO_SHOW'
            ? 'Marked as no show'
            : 'Status updated',
      );
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const vitalInitialData = {
    ...(editingVital ?? {}),
    patient: {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      registrationNumber: patient.registrationNumber,
    },
    station: entry.currentStation
      ? { id: entry.currentStation.id, name: entry.currentStation.name }
      : { id: '', name: '' },
  } as any;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-2 rounded-xl"
        onClick={() => router.push('/service-queue')}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Queue
      </Button>

      {/* Patient header */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg sm:text-xl shrink-0">
              {initials}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight break-words">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{patient.registrationNumber}</span>
                {patient.gender && (
                  <span className="capitalize">
                    · {patient.gender.toLowerCase()}
                  </span>
                )}
                {age(patient.dateOfBirth) && (
                  <span>· {age(patient.dateOfBirth)}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className={prio.className}>
                  {prio.label}
                </Badge>
                <Badge variant="outline" className={stat.className}>
                  <StatIcon className="h-3 w-3 mr-1" />
                  {stat.label}
                </Badge>
                {entry.currentStation && (
                  <Badge variant="secondary" className="gap-1">
                    <Stethoscope className="h-3 w-3" />{' '}
                    {entry.currentStation.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {waitTime(entry.createdAt)} in
                  queue
                </span>
              </div>
              {entry.chiefComplaint && (
                <p className="text-sm text-muted-foreground mt-1">
                  `{entry.chiefComplaint}`
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5 h-11 sm:h-9"
              onClick={load}
              aria-label="Refresh patient chart"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sm:hidden">Refresh</span>
            </Button>
            {entry.status === 'WAITING' && (
              <Can do="update" on="QueueEntry">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 h-11 sm:h-9"
                  onClick={() => handleStatus('IN_SERVICE')}
                >
                  <Play className="h-3.5 w-3.5" /> Start Visit
                </Button>
              </Can>
            )}
            <Can do="update" on="QueueEntry">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-1.5 h-11 sm:h-9"
                onClick={() => setMoveModal(true)}
              >
                <ArrowRight className="h-3.5 w-3.5" /> Move
              </Button>
            </Can>
            {entry.status === 'IN_SERVICE' && (
              <Can do="update" on="QueueEntry">
                <Button
                  size="sm"
                  className="rounded-xl gap-1.5 h-11 sm:h-9 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                  onClick={() => handleStatus('COMPLETED')}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Complete Visit
                </Button>
              </Can>
            )}
            {(entry.status === 'WAITING' || entry.status === 'IN_SERVICE') && (
              <Can do="update" on="QueueEntry">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 h-11 sm:h-9 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => handleStatus('NO_SHOW')}
                >
                  <XCircle className="h-3.5 w-3.5" /> No Show
                </Button>
              </Can>
            )}
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <SectionCard
        title="Vital Signs"
        icon={Activity}
        count={vitalSigns.length}
        onAdd={() => setVitalModal(true)}
        canCreate="VitalSign"
        empty="No vitals recorded for this visit."
      >
        <div>
          {latestVitalNote?.notes && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                    Latest vital-sign note
                  </p>
                  <span className="text-xs text-amber-700/80">
                    {new Date(latestVitalNote.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {latestVitalNote.notes}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 p-3 sm:hidden">
            {vitalSigns.map((v) => (
              <MobileRecordCard
                key={v.id}
                canEdit="VitalSign"
                onEdit={() => openEdit.vital(v)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {new Date(v.createdAt).toLocaleString()}
                  </p>
                  <BmiBadge bmi={v.bmi} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                  <MobileField label="Blood pressure">
                    <span className="font-mono font-semibold">
                      {v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg
                    </span>
                  </MobileField>
                  <MobileField label="Pulse">{v.pulseRate} bpm</MobileField>
                  <MobileField label="Temperature">
                    {v.temperature} °C
                  </MobileField>
                  <MobileField label="Weight">{v.weight} kg</MobileField>
                  <MobileField label="O₂ saturation">
                    {v.oxygenSaturation != null
                      ? `${v.oxygenSaturation}%`
                      : '—'}
                  </MobileField>
                  <MobileField label="Blood glucose">
                    {v.bloodGlucose != null
                      ? `${v.bloodGlucose} mmol/L`
                      : '—'}
                  </MobileField>
                  {v.notes?.trim() && (
                    <MobileField label="Clinical note" full>
                      <p className="whitespace-pre-wrap rounded-lg bg-amber-500/10 p-3 leading-5">
                        {v.notes}
                      </p>
                    </MobileField>
                  )}
                </div>
              </MobileRecordCard>
            ))}
          </div>

          <table className="hidden w-full text-xs sm:table">
            <thead className="bg-muted/40">
              <tr>
                {[
                  'Date',
                  'BP (mmHg)',
                  'Pulse',
                  'Temp (°C)',
                  'Weight (kg)',
                  'BMI',
                  'O₂ (%)',
                  'Glucose',
                  'Notes',
                  '',
                ].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vitalSigns.map((v) => (
                <tr
                  key={v.id}
                  className="border-t border-border/40 hover:bg-muted/20"
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-medium">
                    {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                  </td>
                  <td className="px-4 py-2.5">{v.pulseRate} bpm</td>
                  <td className="px-4 py-2.5">{v.temperature}</td>
                  <td className="px-4 py-2.5">{v.weight}</td>
                  <td className="px-4 py-2.5">
                    <BmiBadge bmi={v.bmi} />
                  </td>
                  <td className="px-4 py-2.5">{v.oxygenSaturation ?? '—'}</td>
                  <td className="px-4 py-2.5">{v.bloodGlucose ?? '—'}</td>
                  <td className="max-w-64 px-4 py-2.5">
                    {v.notes?.trim() ? (
                      <div
                        className="flex items-start gap-1.5 text-foreground"
                        title={v.notes}
                      >
                        <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span className="line-clamp-2">{v.notes}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Can do="update" on="VitalSign">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-lg"
                        onClick={() => openEdit.vital(v)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </Can>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Disease Screening */}
      <SectionCard
        title="Disease Screening"
        icon={AlertTriangle}
        count={communicableDiseases.length}
        onAdd={() => setCdModal(true)}
        canCreate="CommunicableDisease"
        empty="No disease screening recorded for this visit."
      >
        <div className="space-y-3 p-3 sm:hidden">
          {communicableDiseases.map((cd) => (
            <MobileRecordCard
              key={cd.id}
              canEdit="CommunicableDisease"
              onEdit={() => openEdit.cd(cd)}
            >
              <p className="font-semibold">
                {new Date(cd.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <MobileField label="TB screen">
                  <ScreenBadge value={cd.tuberculosisScreen} />
                </MobileField>
                <MobileField label="Malaria screen">
                  <ScreenBadge value={cd.malariaScreen} />
                </MobileField>
                <MobileField label="Fever">
                  {cd.hasFever
                    ? `Yes${cd.feverDurationDays ? ` (${cd.feverDurationDays} days)` : ''}`
                    : 'No'}
                </MobileField>
                <MobileField label="Recent travel">
                  {cd.recentTravel ? 'Yes' : 'No'}
                </MobileField>
                <MobileField label="Contact with infected" full>
                  {cd.contactWithInfected ? 'Yes' : 'No'}
                </MobileField>
                {cd.tuberculosisNotes && (
                  <MobileField label="TB notes" full>
                    {cd.tuberculosisNotes}
                  </MobileField>
                )}
              </div>
            </MobileRecordCard>
          ))}
        </div>
        <table className="hidden w-full text-xs sm:table">
          <thead className="bg-muted/40">
            <tr>
              {[
                'Date',
                'TB Screen',
                'Malaria Screen',
                'Fever',
                'Recent Travel',
                'Contact w/ Infected',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {communicableDiseases.map((cd) => (
              <tr
                key={cd.id}
                className="border-t border-border/40 hover:bg-muted/20"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(cd.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                  <ScreenBadge value={cd.tuberculosisScreen} />
                </td>
                <td className="px-4 py-2.5">
                  <ScreenBadge value={cd.malariaScreen} />
                </td>
                <td className="px-4 py-2.5">
                  {cd.hasFever ? (
                    <span className="text-amber-600 font-medium">
                      Yes{' '}
                      {cd.feverDurationDays ? `(${cd.feverDurationDays}d)` : ''}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <ScreenBadge value={cd.recentTravel} />
                </td>
                <td className="px-4 py-2.5">
                  <ScreenBadge value={cd.contactWithInfected} />
                </td>
                <td className="px-4 py-2.5">
                  <Can do="update" on="CommunicableDisease">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-lg"
                      onClick={() => openEdit.cd(cd)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Mental Health Screenings */}
      <Can do="read" on="PHQ9Screening">
        <SectionCard
        title="Ubuzima bwo mu mutwe (Mental Health)"
        icon={Brain}
        count={phq9List.length}
        onAdd={() => {
          setEditingMH(null);
          setMhModal(true);
        }}
        canCreate="PHQ9Screening"
        empty="No mental health screenings recorded for this visit."
      >
        <div className="space-y-3 p-3 sm:hidden">
          {phq9List.map((phq9, idx) => {
            const gad7 = gad7List[idx];
            const pcl5 = pcl5List[idx];
            return (
              <MobileRecordCard
                key={phq9.id}
                canEdit={gad7 ? 'PHQ9Screening' : undefined}
                onEdit={
                  gad7
                    ? () => {
                        setEditingMH({ phq9, gad7, pcl5 });
                        setMhModal(true);
                      }
                    : undefined
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {new Date(phq9.createdAt).toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {phq9.recordedBy.firstName} {phq9.recordedBy.lastName}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                    <span className="text-sm font-medium">PHQ-9</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{phq9.totalScore}</span>
                      <MHSeverityBadge severity={phq9.severity} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                    <span className="text-sm font-medium">GAD-7</span>
                    {gad7 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{gad7.totalScore}</span>
                        <MHSeverityBadge severity={gad7.severity} />
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                    <span className="text-sm font-medium">PCL-5</span>
                    {patientAgeYears < 18 ? (
                      <span className="text-muted-foreground">N/A</span>
                    ) : pcl5 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{pcl5.totalScore}</span>
                        <MHSeverityBadge severity={pcl5.severity} />
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </MobileRecordCard>
            );
          })}
        </div>
        <table className="hidden w-full text-sm sm:table">
          <thead>
            <tr>
              {[
                'Date',
                'PHQ-9 Score',
                'GAD-7 Score',
                'PCL-5 Score',
                'Recorded By',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phq9List.map((phq9, idx) => {
              const gad7 = gad7List[idx];
              const pcl5 = pcl5List[idx];
              return (
                <tr
                  key={phq9.id}
                  className="border-t border-border/40 hover:bg-muted/20"
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {new Date(phq9.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium">{phq9.totalScore}</span>
                    <span className="ml-2">
                      <MHSeverityBadge severity={phq9.severity} />
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {gad7 ? (
                      <>
                        <span className="font-medium">{gad7.totalScore}</span>
                        <span className="ml-2">
                          <MHSeverityBadge severity={gad7.severity} />
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {patientAgeYears < 18 ? (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    ) : pcl5 ? (
                      <>
                        <span className="font-medium">{pcl5.totalScore}</span>
                        <span className="ml-2">
                          <MHSeverityBadge severity={pcl5.severity} />
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {phq9.recordedBy.firstName} {phq9.recordedBy.lastName}
                  </td>
                  <td className="px-4 py-2.5">
                    <Can do="update" on="PHQ9Screening">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-lg"
                        onClick={() => {
                          if (gad7) {
                            setEditingMH({ phq9, gad7, pcl5 });
                            setMhModal(true);
                          }
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </Can>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </SectionCard>
      </Can>

      {/* Observations */}
      <SectionCard
        title="Observations"
        icon={Stethoscope}
        count={observations.length}
        onAdd={() => setObsModal(true)}
        canCreate="Observation"
        empty="No observations recorded for this visit."
      >
        <div className="space-y-3 p-3 sm:hidden">
          {observations.map((o) => (
            <MobileRecordCard
              key={o.id}
              canEdit="Observation"
              onEdit={() => openEdit.obs(o)}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
                {o.followUpRequired && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Follow-up
                  </Badge>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <MobileField label="Chief complaint" full>
                  {o.chiefComplaint}
                </MobileField>
                <MobileField label="Diagnosis" full>
                  {o.diagnosisCode && (
                    <span className="mr-1 font-mono text-xs text-primary">
                      {o.diagnosisCode}
                    </span>
                  )}
                  {o.diagnosis}
                </MobileField>
                <MobileField label="Treatment given" full>
                  {o.treatmentGiven || '—'}
                </MobileField>
                {o.followUpNotes && (
                  <MobileField label="Follow-up notes" full>
                    {o.followUpNotes}
                  </MobileField>
                )}
              </div>
            </MobileRecordCard>
          ))}
        </div>
        <table className="hidden w-full text-xs sm:table">
          <thead className="bg-muted/40">
            <tr>
              {[
                'Date',
                'Chief Complaint',
                'Diagnosis',
                'Treatment Given',
                'Follow-up',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {observations.map((o) => (
              <tr
                key={o.id}
                className="border-t border-border/40 hover:bg-muted/20"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 max-w-40 truncate">
                  {o.chiefComplaint}
                </td>
                <td className="px-4 py-2.5 max-w-40 truncate">{o.diagnosis}</td>
                <td className="px-4 py-2.5 max-w-45 truncate">
                  {o.treatmentGiven ?? (
                    <span className="text-muted-foreground/50 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {o.followUpRequired ? (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Can do="update" on="Observation">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-lg"
                      onClick={() => openEdit.obs(o)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Lab Results */}
      <SectionCard
        title="Lab Results"
        icon={FlaskConical}
        count={labResults.length}
        onAdd={() => setLabModal(true)}
        canCreate="LabResult"
        empty="No lab results recorded for this visit."
      >
        <div className="space-y-3 p-3 sm:hidden">
          {labResults.map((l) => (
            <MobileRecordCard
              key={l.id}
              canEdit="LabResult"
              onEdit={() => openEdit.lab(l)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{l.testType}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge
                  className={
                    l.isAbnormal
                      ? 'bg-red-500/10 text-red-600 border-red-500/30'
                      : 'bg-green-500/10 text-green-600 border-green-500/30'
                  }
                >
                  {l.isAbnormal ? 'Abnormal' : 'Normal'}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <MobileField label="Result">
                  <span className="font-mono font-semibold">
                    {l.resultValue}
                  </span>
                </MobileField>
                <MobileField label="Unit">{l.resultUnit || '—'}</MobileField>
                {l.notes && (
                  <MobileField label="Notes" full>
                    {l.notes}
                  </MobileField>
                )}
              </div>
            </MobileRecordCard>
          ))}
        </div>
        <table className="hidden w-full text-xs sm:table">
          <thead className="bg-muted/40">
            <tr>
              {[
                'Date',
                'Test Type',
                'Result',
                'Unit',
                'Abnormal',
                'Notes',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labResults.map((l) => (
              <tr
                key={l.id}
                className="border-t border-border/40 hover:bg-muted/20"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(l.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 font-medium">{l.testType}</td>
                <td className="px-4 py-2.5 font-mono">{l.resultValue}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {l.resultUnit ?? '—'}
                </td>
                <td className="px-4 py-2.5">
                  {l.isAbnormal ? (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                      Abnormal
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                      Normal
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2.5 max-w-45 truncate text-muted-foreground">
                  {l.notes ?? '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Can do="update" on="LabResult">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-lg"
                      onClick={() => openEdit.lab(l)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Prescriptions */}
      <SectionCard
        title="Prescriptions"
        icon={Pill}
        count={prescriptions.length}
        onAdd={() => setRxModal(true)}
        canCreate="Prescription"
        empty="No prescriptions for this visit."
      >
        <div className="space-y-3 p-3 sm:hidden">
          {prescriptions.map((rx) => (
            <MobileRecordCard key={rx.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {rx.pharmacyStock.medicationName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rx.pharmacyStock.genericName} ·{' '}
                    {rx.pharmacyStock.strength}
                  </p>
                </div>
                <PrescriptionStatusBadge
                  status={rx.status}
                  dispensedBy={rx.dispensedBy}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <MobileField label="Date">
                  {new Date(rx.createdAt).toLocaleString()}
                </MobileField>
                <MobileField label="Dosage">{rx.dosage}</MobileField>
                <MobileField label="Quantity">
                  {rx.quantity} {rx.pharmacyStock.unitOfMeasure}
                </MobileField>
                <MobileField label="Prescribed by">
                  {rx.prescribedBy.firstName} {rx.prescribedBy.lastName}
                </MobileField>
                <MobileField label="Instructions" full>
                  {rx.instructions || '—'}
                </MobileField>
              </div>
              {rx.status === 'PENDING' && (
                <Can do="update" on="Prescription">
                  <Button
                    type="button"
                    className="mt-4 h-11 w-full rounded-xl gap-2"
                    onClick={() => setDispenseTarget(rx)}
                  >
                    <Pill className="h-4 w-4" /> Dispense medication
                  </Button>
                </Can>
              )}
            </MobileRecordCard>
          ))}
        </div>
        <table className="hidden w-full text-xs sm:table">
          <thead className="bg-muted/40">
            <tr>
              {[
                'Date',
                'Medication',
                'Dosage',
                'Qty',
                'Instructions',
                'Prescribed By',
                'Status',
                'Action',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx: PrescriptionRecord) => (
              <PrescriptionRow
                key={rx.id}
                rx={rx}
                onDispenseClick={(r) => setDispenseTarget(r)}
              />
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Transfers */}
      <SectionCard
        title="Referrals & Transfers"
        icon={Ambulance}
        count={transfers.length}
        onAdd={() => setTransferModal(true)}
        canCreate="Transfer"
        empty="No referrals recorded for this visit."
      >
        <div className="space-y-3 p-3 sm:hidden">
          {transfers.map((t) => (
            <MobileRecordCard
              key={t.id}
              canEdit="Transfer"
              onEdit={() => openEdit.transfer(t)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{t.referredToFacility}</p>
                <UrgencyBadge urgency={t.urgency} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(t.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <MobileField label="Service" full>
                  {t.referredService}
                </MobileField>
                <MobileField label="Reason" full>
                  {t.transferReason}
                </MobileField>
                <MobileField label="Transport">
                  {t.transportArranged ? 'Arranged' : 'Not arranged'}
                </MobileField>
                {t.notes && (
                  <MobileField label="Notes" full>
                    {t.notes}
                  </MobileField>
                )}
              </div>
            </MobileRecordCard>
          ))}
        </div>
        <table className="hidden w-full text-xs sm:table">
          <thead className="bg-muted/40">
            <tr>
              {[
                'Date',
                'Referred To',
                'Service',
                'Urgency',
                'Reason',
                'Transport',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr
                key={t.id}
                className="border-t border-border/40 hover:bg-muted/20"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 font-medium">
                  {t.referredToFacility}
                </td>
                <td className="px-4 py-2.5">{t.referredService}</td>
                <td className="px-4 py-2.5">
                  <UrgencyBadge urgency={t.urgency} />
                </td>
                <td className="px-4 py-2.5 max-w-45 truncate">
                  {t.transferReason}
                </td>
                <td className="px-4 py-2.5">
                  {t.transportArranged ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                      Arranged
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Can do="update" on="Transfer">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-lg"
                      onClick={() => openEdit.transfer(t)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      {/* Modals */}
      <VitalSignModal
        open={vitalModal}
        onOpenChange={(open) => {
          if (!open) closeModal.vital();
          else setVitalModal(true);
        }}
        mode={editingVital ? 'edit' : 'create'}
        initialData={vitalInitialData}
        onSubmit={async (values) => {
          if (editingVital) {
            await dispatch(
              updateVitalSign({ id: editingVital.id, data: values }),
            ).unwrap();
            toast.success('Vital signs updated');
          } else {
            await dispatch(
              createVitalSign({
                ...values,
                patientId: patient.id,
                outreachId: entry.outreach.id,
              }),
            ).unwrap();
            toast.success('Vital signs recorded');
          }
          load();
        }}
      />
      <CommunicableDiseaseModal
        open={cdModal}
        onOpenChange={(open) => {
          if (!open) {
            closeModal.cd();
            load();
          } else setCdModal(true);
        }}
        entry={entry as QueueEntry}
        record={editingCd}
      />
      <ObservationModal
        open={obsModal}
        onOpenChange={(open) => {
          if (!open) {
            closeModal.obs();
            load();
          } else setObsModal(true);
        }}
        entry={entry as QueueEntry}
        record={editingObs}
      />
      <LabResultModal
        open={labModal}
        onOpenChange={(open) => {
          if (!open) {
            closeModal.lab();
            load();
          } else setLabModal(true);
        }}
        entry={entry as QueueEntry}
        record={editingLab}
      />
      <TransferModal
        open={transferModal}
        onOpenChange={(open) => {
          if (!open) {
            closeModal.transfer();
            load();
          } else setTransferModal(true);
        }}
        entry={entry as QueueEntry}
        record={editingTransfer}
      />
      <MovePatientModal
        open={moveModal}
        onOpenChange={setMoveModal}
        entry={entry as QueueEntry}
        onSuccess={() => router.push('/service-queue')}
      />
      <PrescriptionModal
        open={rxModal}
        onOpenChange={(open) => {
          setRxModal(open);
          if (!open) load();
        }}
        entry={entry as QueueEntry}
      />
      <DispenseConfirmModal
        open={!!dispenseTarget}
        onOpenChange={(open) => {
          if (!open) setDispenseTarget(null);
        }}
        rx={dispenseTarget}
        onConfirm={async () => {
          await dispatch(dispensePrescription(dispenseTarget!.id)).unwrap();
          toast.success('Medication dispensed and stock updated');
          setDispenseTarget(null);
          load();
        }}
      />
      <MentalHealthScreeningModal
        open={mhModal}
        onOpenChange={(open) => {
          setMhModal(open);
          if (!open) setEditingMH(null);
        }}
        entry={entry as QueueEntry}
        record={editingMH}
        onSaved={() => {
          setMhModal(false);
          setEditingMH(null);
          load();
        }}
      />
    </div>
  );
}

function PrescriptionRow({
  rx,
  onDispenseClick,
}: {
  rx: PrescriptionRecord;
  onDispenseClick: (rx: PrescriptionRecord) => void;
}) {
  return (
    <tr className="border-t border-border/40 hover:bg-muted/20">
      <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
        {new Date(rx.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2.5">
        <div className="font-medium">{rx.pharmacyStock.medicationName}</div>
        <div className="text-muted-foreground">
          {rx.pharmacyStock.genericName} · {rx.pharmacyStock.strength}
        </div>
      </td>
      <td className="px-4 py-2.5">{rx.dosage}</td>
      <td className="px-4 py-2.5">
        {rx.quantity} {rx.pharmacyStock.unitOfMeasure}
      </td>
      <td className="px-4 py-2.5 max-w-36 truncate text-muted-foreground">
        {rx.instructions ?? '—'}
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        {rx.prescribedBy.firstName} {rx.prescribedBy.lastName}
      </td>
      <td className="px-4 py-2.5">
        <PrescriptionStatusBadge
          status={rx.status}
          dispensedBy={rx.dispensedBy}
        />
      </td>
      <td className="px-4 py-2.5">
        {rx.status === 'PENDING' && (
          <Can do="update" on="Prescription">
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg h-7 gap-1 text-xs"
              onClick={() => onDispenseClick(rx)}
            >
              <Pill className="h-3 w-3" /> Dispense
            </Button>
          </Can>
        )}
      </td>
    </tr>
  );
}

function BmiBadge({ bmi }: { bmi: number }) {
  if (bmi < 18.5)
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
        {bmi.toFixed(1)} UW
      </Badge>
    );
  if (bmi < 25)
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
        {bmi.toFixed(1)}
      </Badge>
    );
  if (bmi < 30)
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
        {bmi.toFixed(1)} OW
      </Badge>
    );
  return (
    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
      {bmi.toFixed(1)} OB
    </Badge>
  );
}

function ScreenBadge({ value }: { value: boolean }) {
  return value ? (
    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
      Positive
    </Badge>
  ) : (
    <span className="text-muted-foreground">Negative</span>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, string> = {
    EMERGENCY: 'bg-red-500/10 text-red-600 border-red-500/30',
    URGENT: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    ROUTINE: 'bg-slate-100 text-slate-600 border-slate-300',
  };
  return (
    <Badge
      className={`text-xs ${map[urgency] ?? 'bg-slate-100 text-slate-600 border-slate-300'}`}
    >
      {urgency}
    </Badge>
  );
}

function PrescriptionStatusBadge({
  status,
  dispensedBy,
}: {
  status: string;
  dispensedBy: { firstName: string; lastName: string } | null;
}) {
  if (status === 'DISPENSED') {
    return (
      <div className="space-y-0.5">
        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
          Dispensed
        </Badge>
        {dispensedBy && (
          <div className="text-muted-foreground text-[10px]">
            by {dispensedBy.firstName} {dispensedBy.lastName}
          </div>
        )}
      </div>
    );
  }
  if (status === 'CANCELLED') {
    return (
      <Badge className="bg-slate-100 text-slate-500 border-slate-300 text-xs">
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
      Pending
    </Badge>
  );
}
