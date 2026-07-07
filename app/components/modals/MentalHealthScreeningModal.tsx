/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { StationMoveSection } from '@/app/components/modals/shared/StationMoveSection';
import { useRouter } from 'next/navigation';
import {
  createPHQ9Screening,
  updatePHQ9Screening,
} from '@/app/store/phq9-screenings';
import {
  createGAD7Screening,
  updateGAD7Screening,
} from '@/app/store/gad7-screenings';
import {
  createPCL5Screening,
  updatePCL5Screening,
} from '@/app/store/pcl5-screenings';
import { QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { PHQ9Screening } from '@/app/store/phq9-screenings/phq9-screenings.types';
import { GAD7Screening } from '@/app/store/gad7-screenings/gad7-screenings.types';
import { PCL5Screening } from '@/app/store/pcl5-screenings/pcl5-screenings.types';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function patientAge(dateOfBirth?: string): number {
  if (!dateOfBirth) return 99;
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / 31_557_600_000,
  );
}

function phq9Severity(total: number) {
  if (total <= 4)
    return {
      label: 'No depression',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    };
  if (total <= 9)
    return {
      label: 'Mild depression',
      color: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    };
  if (total <= 14)
    return {
      label: 'Moderate depression',
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    };
  if (total <= 19)
    return {
      label: 'Moderately severe depression',
      color: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
    };
  return {
    label: 'Severe depression',
    color: 'bg-destructive/10 text-destructive border-destructive/30',
  };
}

function gad7Severity(total: number) {
  if (total <= 4)
    return {
      label: 'No anxiety',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    };
  if (total <= 9)
    return {
      label: 'Mild anxiety',
      color: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    };
  if (total <= 14)
    return {
      label: 'Moderate anxiety',
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    };
  return {
    label: 'Severe anxiety',
    color: 'bg-destructive/10 text-destructive border-destructive/30',
  };
}

function pcl5Severity(total: number) {
  if (total <= 19)
    return {
      label: 'No trauma',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    };
  if (total <= 31)
    return {
      label: 'Mild trauma',

      color: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    };
  if (total <= 43)
    return {
      label: 'Moderate trauma',
      color: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
    };
  return {
    label: 'Severe trauma',
    color: 'bg-destructive/10 text-destructive border-destructive/30',
  };
}

// ─── Radio group ─────────────────────────────────────────────────────────────

const PHQ9_OPTIONS = [
  { value: 0, label: 'Habe na gato' },
  { value: 1, label: "Munsi y'iminsi y'icyumweru" },
  { value: 2, label: "Hejuru y'icyumweru" },
  { value: 3, label: 'Hafi buri munsi' },
];

const GAD7_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const PCL5_OPTIONS = [
  { value: 0, label: 'Ntana rimwe' },
  { value: 1, label: 'Gake cyane' },
  { value: 2, label: 'Biringaniye' },
  { value: 3, label: 'Kenshi' },
  { value: 4, label: 'Birenze urugero' },
];

function RadioGroup({
  question,
  index,
  options,
  value,
  onChange,
}: {
  question: string;
  index: number;
  options: { value: number; label: string }[];
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <fieldset className="space-y-3 border-b border-border/50 py-5 last:border-0">
      <legend className="w-full text-sm font-semibold leading-6 text-foreground sm:text-base">
        <span className="mr-2 text-muted-foreground">{index}.</span>
        {question}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            aria-label={`${question}: ${opt.label}`}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors touch-manipulation',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                value === opt.value
                  ? 'border-primary-foreground'
                  : 'border-muted-foreground/50',
              )}
            >
              {value === opt.value && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
              )}
            </span>
            <span className="leading-5">{opt.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({
  label,
  score,
  max,
  severity,
}: {
  label: string;
  score: number;
  max: number;
  severity: { label: string; color: string };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className="font-bold tabular-nums">
        {score}/{max}
      </span>
      <Badge className={cn('text-xs border px-2 py-0.5', severity.color)}>
        {severity.label}
      </Badge>
    </div>
  );
}

// ─── Step content components ──────────────────────────────────────────────────

const PHQ9_QUESTIONS = [
  'Kudashishikarira ibyo ukora cyangwa ntushimishwe nabyo',
  'Kumva wacitse intege, ufite agahinda, cyangwa nta cyizere',
  'Kubura ibitotsi, kubicikiriza hagati, cyangwa gusinzira bikabije',
  'Kumva unaniwe cyangwa ufite intege nke',
  'Kumva udashaka kurya cyangwa kurya cyane bidasanzwe',
  'Kumva wiyanze, kumva nta kamaro ufite, kumva ntacyo wimariye',
  'Ingorane zo kwita ku bintu nko kumva radiyo cyangwa kwita kumuryango',
  'Kugenda buhoro cyangwa kurandaga, cyangwa kugendagenda ntugumanye hamwe',
  "Ibitekerezo by'uko byaba byiza upfuye cyangwa wigiriye nabi",
];

const PHQ9_FIELDS = [
  'q1LittleInterest',
  'q2Depressed',
  'q3SleepProblems',
  'q4Fatigue',
  'q5Appetite',
  'q6Worthlessness',
  'q7Concentration',
  'q8Psychomotor',
  'q9SelfHarm',
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const GAD7_FIELDS = [
  'q1Anxious',
  'q2Uncontrollable',
  'q3Worrying',
  'q4Relaxing',
  'q5Restless',
  'q6Irritable',
  'q7Afraid',
];

const PCL5_QUESTIONS = [
  'Ibitekerezo utifuza, bihora bigaruka bikakubuza amahwemo biturutse ku kibazo cyagushegeshe?',
  "Kurota inzozi mbi zihora zigaruka zijyanye n'ibyakubayeho?",
  "Kugaragaza ku buryo butunguranye imbamutima cg imyitwarire nk'aho wasubiye mu byakubayeho?",
  'Kumva utameze neza iyo hari ikikwibukije ibyakubayeho?',
  'Kugaragaza impinduka mu mubiri zikabije iyo hari ikikwibukije ibyakubayeho?',
  'Kwihunza ibitekerezo, imbamutima cg ibindi byose byibutsa icyagushegeshe?',
  "Kwirinda guhura n'ibikwibutsa ibihe bibi wanyuzemo?",
  'Kunanirwa kwibuka bimwe mu bihe bikomeye byagushegeshe?',
  "Kwitakariza icyizere, kugitakariza abandi n'ibindi bintu byose?",
  "Kwishinja kugira uruhare mu byakubayeho n'ingaruka zabyo cyangwa kubishinja undi?",
  'Kugira ibyiyumviro bibi cyane, nko gutinya, ubwoba bukabije, umujinya, ipfunwe cyangwa ikimwaro?',
  "Kuba utagishimishwa n'ibikorwa byakunezezaga mbere?",
  'Kumva uri wenyine cg warabaye igicibwa mu bandi?',
  'Kubura ibyishimo (urugero: kutagira umunezero cyangwa ntubashe gukunda abo mubana)?',
  "Kurakazwa n'ubusa, kuka abantu inabi cyangwa kurwana?",
  'Kwishora mu bikorwa byagushyira mu kaga cyangwa gukora ibintu bishobora kukugirira nabi?',
  'Guhora uryamiye amajanja cg guhora witeguye kwirwanaho?',
  'Gushikagurika no kuba igikange?',
  'Kunanirwa guhugira ku kintu runaka?',
  'Kubura ibitotsi cg kutabasha gusinzira bihagije?',
];

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepPHQ9({
  values,
  setFieldValue,
}: {
  values: any;
  setFieldValue: (f: string, v: any) => void;
}) {
  const total = PHQ9_FIELDS.reduce((s, f) => s + (values[f] ?? 0), 0);
  const sev = phq9Severity(total);
  return (
    <div className="space-y-1">
      <div className="mb-2 flex flex-col gap-3 rounded-xl bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-5 text-muted-foreground">
          Mu byumweru bibiri bishize, ni inshuro zingahe wabujijwe amahoro na
          kimwe mu bibazo bikurikira?
        </p>
        <ScoreBadge label="PHQ-9" score={total} max={27} severity={sev} />
      </div>
      {PHQ9_QUESTIONS.map((q, i) => (
        <RadioGroup
          key={i}
          question={q}
          index={i + 1}
          options={PHQ9_OPTIONS}
          value={values[PHQ9_FIELDS[i]] ?? 0}
          onChange={(v) => setFieldValue(PHQ9_FIELDS[i], v)}
        />
      ))}
    </div>
  );
}

function StepGAD7({
  values,
  setFieldValue,
}: {
  values: any;
  setFieldValue: (f: string, v: any) => void;
}) {
  const total = GAD7_FIELDS.reduce((s, f) => s + (values[f] ?? 0), 0);
  const sev = gad7Severity(total);
  return (
    <div className="space-y-1">
      <div className="mb-2 flex flex-col gap-3 rounded-xl bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-5 text-muted-foreground">
          Over the last 2 weeks, how often have you been bothered by the
          following?
        </p>
        <ScoreBadge label="GAD-7" score={total} max={21} severity={sev} />
      </div>
      {GAD7_QUESTIONS.map((q, i) => (
        <RadioGroup
          key={i}
          question={q}
          index={i + 1}
          options={GAD7_OPTIONS}
          value={values[GAD7_FIELDS[i]] ?? 0}
          onChange={(v) => setFieldValue(GAD7_FIELDS[i], v)}
        />
      ))}
    </div>
  );
}

const MARITAL_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];
const EDUCATION_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
  { value: 'TERTIARY', label: 'Tertiary' },
];
const OCCUPATION_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
];
const DIVISION_OPTIONS = ['I', 'II', 'III', 'IV'].map((v) => ({
  value: v,
  label: `${v}`,
}));
const LOCATION_OPTIONS = [
  { value: 'URBAN', label: 'Urban' },
  { value: 'RURAL_SEMI_URBAN', label: 'Rural/Semi-Urban' },
];
const RELIGION_OPTIONS = [
  { value: 'CATHOLIC', label: 'Catholic' },
  { value: 'PROTESTANT', label: 'Protestant' },
  { value: 'MUSLIM', label: 'Muslim' },
  { value: 'TRADITIONAL', label: 'Traditional' },
  { value: 'OTHER', label: 'Other' },
];

function SelectGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground/80">
        {label}
      </Label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'min-h-12 w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors touch-manipulation',
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPCL5Demographics({
  values,
  setFieldValue,
}: {
  values: any;
  setFieldValue: (f: string, v: any) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-muted/40 p-3">
        <p className="text-sm font-semibold">Demographic information</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Complete all fields before continuing to the screening questions.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground/80">
          Intera z&apos;izina (Initial) *
        </Label>
        <input
          type="text"
          maxLength={10}
          value={values.initialOfParticipant ?? ''}
          onChange={(e) =>
            setFieldValue('initialOfParticipant', e.target.value)
          }
          placeholder="Urugero: JD"
          className="h-12 w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <SelectGroup
        label="Marital Status *"
        options={MARITAL_OPTIONS}
        value={values.maritalStatus ?? ''}
        onChange={(v) => setFieldValue('maritalStatus', v)}
      />
      <SelectGroup
        label="Education *"
        options={EDUCATION_OPTIONS}
        value={values.educationLevel ?? ''}
        onChange={(v) => setFieldValue('educationLevel', v)}
      />
      <SelectGroup
        label="Occupation *"
        options={OCCUPATION_OPTIONS}
        value={values.occupation ?? ''}
        onChange={(v) => setFieldValue('occupation', v)}
      />
      <SelectGroup
        label="Division *"
        options={DIVISION_OPTIONS}
        value={values.division ?? ''}
        onChange={(v) => setFieldValue('division', v)}
      />
      <SelectGroup
        label="Location *"
        options={LOCATION_OPTIONS}
        value={values.locationType ?? ''}
        onChange={(v) => setFieldValue('locationType', v)}
      />
      <SelectGroup
        label="Religion *"
        options={RELIGION_OPTIONS}
        value={values.religion ?? ''}
        onChange={(v) => setFieldValue('religion', v)}
      />
    </div>
  );
}

function StepPCL5Questions({
  values,
  setFieldValue,
}: {
  values: any;
  setFieldValue: (f: string, v: any) => void;
}) {
  const total = Array.from(
    { length: 20 },
    (_, i) => values[`pcl5_q${i + 1}`] ?? 0,
  ).reduce((s, v) => s + v, 0);
  const sev = pcl5Severity(total);
  return (
    <div className="space-y-1">
      <div className="mb-2 flex flex-col gap-3 rounded-xl bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-5 text-muted-foreground">
          Mu kwezi gushize, ibi bikurikira byakubayeho ku ruhe rugero?
        </p>
        <ScoreBadge label="PCL-5" score={total} max={80} severity={sev} />
      </div>
      {PCL5_QUESTIONS.map((q, i) => (
        <RadioGroup
          key={i}
          question={q}
          index={i + 1}
          options={PCL5_OPTIONS}
          value={values[`pcl5_q${i + 1}`] ?? 0}
          onChange={(v) => setFieldValue(`pcl5_q${i + 1}`, v)}
        />
      ))}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface EditRecord {
  phq9: PHQ9Screening;
  gad7: GAD7Screening;
  pcl5?: PCL5Screening;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  record?: EditRecord | null;
  onSaved: () => void;
}

function buildInitialValues(record?: EditRecord | null) {
  return {
    // PHQ-9
    q1LittleInterest: record?.phq9.q1LittleInterest ?? 0,
    q2Depressed: record?.phq9.q2Depressed ?? 0,
    q3SleepProblems: record?.phq9.q3SleepProblems ?? 0,
    q4Fatigue: record?.phq9.q4Fatigue ?? 0,
    q5Appetite: record?.phq9.q5Appetite ?? 0,
    q6Worthlessness: record?.phq9.q6Worthlessness ?? 0,
    q7Concentration: record?.phq9.q7Concentration ?? 0,
    q8Psychomotor: record?.phq9.q8Psychomotor ?? 0,
    q9SelfHarm: record?.phq9.q9SelfHarm ?? 0,
    // GAD-7
    q1Anxious: record?.gad7.q1Anxious ?? 0,
    q2Uncontrollable: record?.gad7.q2Uncontrollable ?? 0,
    q3Worrying: record?.gad7.q3Worrying ?? 0,
    q4Relaxing: record?.gad7.q4Relaxing ?? 0,
    q5Restless: record?.gad7.q5Restless ?? 0,
    q6Irritable: record?.gad7.q6Irritable ?? 0,
    q7Afraid: record?.gad7.q7Afraid ?? 0,
    // PHQ-9 is the common record for every mental-health screening.
    // PCL-5 remains a fallback for records created before this change.
    initialOfParticipant:
      record?.phq9.initialOfParticipant ??
      record?.pcl5?.initialOfParticipant ??
      '',
    maritalStatus:
      record?.phq9.maritalStatus ?? record?.pcl5?.maritalStatus ?? '',
    educationLevel:
      record?.phq9.educationLevel ?? record?.pcl5?.educationLevel ?? '',
    occupation: record?.phq9.occupation ?? record?.pcl5?.occupation ?? '',
    division: record?.phq9.division ?? record?.pcl5?.division ?? '',
    locationType: record?.phq9.locationType ?? record?.pcl5?.locationType ?? '',
    religion: record?.phq9.religion ?? record?.pcl5?.religion ?? '',
    // PCL-5 questions (q1–q20 stored as pcl5_q1..pcl5_q20)
    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        `pcl5_q${i + 1}`,
        (record?.pcl5 as any)?.[`q${i + 1}`] ?? 0,
      ]),
    ),
  };
}

function hasCompleteDemographics(values: Record<string, unknown>) {
  return [
    values.initialOfParticipant,
    values.maritalStatus,
    values.educationLevel,
    values.occupation,
    values.division,
    values.locationType,
    values.religion,
  ].every((value) => String(value ?? '').trim().length > 0);
}

export function MentalHealthScreeningModal({
  open,
  onOpenChange,
  entry,
  record,
  onSaved,
}: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: allStations } = useAppSelector((s) => s.stations);
  const [step, setStep] = useState(0);
  const [moveStationId, setMoveStationId] = useState('');
  const submitIntent = useRef<'save' | 'saveAndMove'>('save');

  const availableStations = entry
    ? allStations.filter((s) => (s as any).outreach?.id === entry.outreach.id && s.id !== entry.currentStation?.id)
    : [];

  useEffect(() => {
    if (!open || !entry) return;
    setMoveStationId('');
    submitIntent.current = 'save';
    dispatch(fetchStations({ outreachId: entry.outreach.id, isActive: true, limit: 100 }));
  }, [open, entry, dispatch]);

  const age = patientAge(entry?.patient.dateOfBirth);
  const isAdult = age >= 18;
  const totalSteps = isAdult ? 4 : 3;
  const isEditing = !!record;

  const STEP_LABELS = useMemo(
    () =>
      isAdult
        ? ['Demographic', 'PHQ-9', 'GAD-7', 'PCL-5: Ibibazo']
        : ['Demographic', 'PHQ-9', 'GAD-7'],
    [isAdult],
  );

  if (!entry) return null;

  const initialValues = buildInitialValues(record);

  const handleClose = () => {
    setStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none rounded-2xl p-0 overflow-hidden flex flex-col sm:h-auto sm:max-h-[92vh] sm:max-w-4xl">
        {/* Header */}
        <div className="shrink-0 border-b border-border/50 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogHeader>
            <div className="flex items-start gap-2.5 pr-8">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base leading-6 sm:text-lg">
                  {isEditing
                    ? "Hindura isuzuma ry'ubuzima bwo mu mutwe"
                    : "Isuzuma ry'ubuzima bwo mu mutwe"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs leading-5 sm:text-sm">
                  {entry.patient.firstName} {entry.patient.lastName}
                  {!isAdult && (
                    <span className="ml-2 text-amber-600 font-medium">
                      (Imyaka &lt;18 — Demographic, PHQ-9 na GAD-7)
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Step indicator */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <span className="text-xs font-semibold text-primary">
                Step {step + 1} of {totalSteps}
              </span>
              <span className="max-w-[70%] truncate text-xs font-medium text-foreground">
                {STEP_LABELS[step]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0 transition-colors',
                      i < step
                        ? 'bg-primary text-primary-foreground'
                        : i === step
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium hidden sm:block',
                      i === step ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                  {i < totalSteps - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 rounded-full',
                        i < step ? 'bg-primary' : 'bg-muted',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={Yup.object({})}
          onSubmit={async (values, { setSubmitting }) => {
            if (step === 0 && !hasCompleteDemographics(values)) {
              toast.error('Complete all demographic fields before continuing.');
              setSubmitting(false);
              return;
            }
            // Guard: never save from a non-final step (handles any accidental submission)
            if (step < totalSteps - 1) {
              setStep((s) => s + 1);
              setSubmitting(false);
              return;
            }
            if (!entry) return;
            const commonIds = {
              queueEntryId: entry.id,
              patientId: entry.patient.id,
              stationId: entry.currentStation?.id ?? '',
              outreachId: entry.outreach.id,
            };

            const phq9Payload = {
              ...commonIds,
              initialOfParticipant: values.initialOfParticipant,
              maritalStatus: values.maritalStatus,
              educationLevel: values.educationLevel,
              occupation: values.occupation,
              division: values.division,
              locationType: values.locationType,
              religion: values.religion,
              q1LittleInterest: values.q1LittleInterest,
              q2Depressed: values.q2Depressed,
              q3SleepProblems: values.q3SleepProblems,
              q4Fatigue: values.q4Fatigue,
              q5Appetite: values.q5Appetite,
              q6Worthlessness: values.q6Worthlessness,
              q7Concentration: values.q7Concentration,
              q8Psychomotor: values.q8Psychomotor,
              q9SelfHarm: values.q9SelfHarm,
            };

            const gad7Payload = {
              ...commonIds,
              q1Anxious: values.q1Anxious,
              q2Uncontrollable: values.q2Uncontrollable,
              q3Worrying: values.q3Worrying,
              q4Relaxing: values.q4Relaxing,
              q5Restless: values.q5Restless,
              q6Irritable: values.q6Irritable,
              q7Afraid: values.q7Afraid,
            };

            const pcl5Payload = isAdult
              ? {
                  ...commonIds,
                  initialOfParticipant:
                    values.initialOfParticipant || undefined,
                  maritalStatus: values.maritalStatus || undefined,
                  educationLevel: values.educationLevel || undefined,
                  occupation: values.occupation || undefined,
                  division: values.division || undefined,
                  locationType: values.locationType || undefined,
                  religion: values.religion || undefined,
                  ...Object.fromEntries(
                    Array.from({ length: 20 }, (_, i) => [
                      `q${i + 1}`,
                      (values as any)[`pcl5_q${i + 1}`],
                    ]),
                  ),
                }
              : null;

            try {
              await Promise.all([
                isEditing
                  ? dispatch(
                      updatePHQ9Screening({
                        id: record!.phq9.id,
                        data: phq9Payload,
                      }),
                    ).unwrap()
                  : dispatch(createPHQ9Screening(phq9Payload)).unwrap(),
                isEditing
                  ? dispatch(
                      updateGAD7Screening({
                        id: record!.gad7.id,
                        data: gad7Payload,
                      }),
                    ).unwrap()
                  : dispatch(createGAD7Screening(gad7Payload)).unwrap(),
                ...(pcl5Payload
                  ? [
                      isEditing && record?.pcl5
                        ? dispatch(
                            updatePCL5Screening({
                              id: record.pcl5.id,
                              data: pcl5Payload,
                            }),
                          ).unwrap()
                        : dispatch(createPCL5Screening(pcl5Payload)).unwrap(),
                    ]
                  : []),
              ]);
              toast.success(
                isEditing ? 'Isuzuma ryahinduwe' : 'Isuzuma ryanditswe',
              );
              onSaved();
              if (submitIntent.current === 'saveAndMove' && !isEditing && moveStationId) {
                await dispatch(moveQueueEntry({ id: entry.id, data: { stationId: moveStationId } })).unwrap();
                toast.success('Patient moved successfully');
                handleClose();
                router.push('/service-queue');
              } else {
                handleClose();
              }
            } catch {
              toast.error('Habaye ikosa. Ongera ugerageze.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting, submitForm }) => {
            const demographicsComplete = hasCompleteDemographics(values);

            return (
              <Form className="flex flex-col flex-1 min-h-0">
                {/* Scrollable content */}
                <div className="flex-1 overscroll-contain overflow-y-auto px-4 py-2 sm:px-6 sm:py-4">
                  {step === 0 && (
                    <StepPCL5Demographics
                      values={values}
                      setFieldValue={setFieldValue}
                    />
                  )}
                  {step === 1 && (
                    <StepPHQ9 values={values} setFieldValue={setFieldValue} />
                  )}
                  {step === 2 && (
                    <StepGAD7 values={values} setFieldValue={setFieldValue} />
                  )}
                  {step === 3 && isAdult && (
                    <StepPCL5Questions
                      values={values}
                      setFieldValue={setFieldValue}
                    />
                  )}
                </div>

                {/* Footer buttons */}
                <div className="shrink-0 border-t border-border/50 bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6 sm:py-4 space-y-3">
                  {step === totalSteps - 1 && !isEditing && (
                    <StationMoveSection
                      stations={availableStations}
                      value={moveStationId}
                      onChange={setMoveStationId}
                      currentStationId={entry.currentStation?.id}
                    />
                  )}
                  <div className={step === totalSteps - 1 && !isEditing ? 'grid grid-cols-1 gap-2 sm:flex sm:justify-end' : 'grid grid-cols-2 gap-3'}>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-xl text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        if (step === 0) {
                          handleClose();
                        } else {
                          setStep((s) => s - 1);
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {step === 0 ? 'Cancel' : 'Back'}
                    </Button>

                    {step < totalSteps - 1 ? (
                      <Button
                        type="button"
                        className="h-12 rounded-xl text-sm"
                        disabled={step === 0 && !demographicsComplete}
                        onClick={(e) => {
                          e.preventDefault();
                          setStep((s) => s + 1);
                        }}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 rounded-xl text-sm sm:w-auto"
                          disabled={isSubmitting}
                          onClick={() => { submitIntent.current = 'save'; submitForm(); }}
                        >
                          {isSubmitting && submitIntent.current === 'save' ? 'Saving...' : isEditing ? 'Update' : 'Save'}
                        </Button>
                        {!isEditing && (
                          <Button
                            type="button"
                            className="h-12 rounded-xl text-sm sm:w-auto"
                            disabled={isSubmitting}
                            onClick={() => {
                              if (!moveStationId) { toast.error('Select a destination station first'); return; }
                              submitIntent.current = 'saveAndMove';
                              submitForm();
                            }}
                          >
                            {isSubmitting && submitIntent.current === 'saveAndMove' ? 'Saving...' : 'Save & Move →'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
