'use client';

import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchPatients } from '@/app/store/patients';
import { fetchStations } from '@/app/store/stations';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { VitalSign } from '@/app/store/vital-signs/vital-signs.types';
import { StationMoveSection } from '@/app/components/modals/shared/StationMoveSection';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VitalSignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: VitalSign | null;
  onSubmit: (values: any) => Promise<void>;
  entry?: QueueEntry | null;
}

function getPatientAgeYears(dob?: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31_557_600_000);
}

function makeSchema(isUnderFifteen: boolean) {
  const optionalNumeric = (min: number, max: number) =>
    Yup.number().typeError('Must be a number').min(min).max(max).nullable().optional();

  const requiredNumeric = (min: number, max: number, msg: string) =>
    Yup.number().typeError('Must be a number').min(min).max(max).required(msg);

  return Yup.object({
    patientId: Yup.string().required('Patient is required'),
    stationId: Yup.string().required('Station is required'),
    bloodPressureSystolic: isUnderFifteen
      ? optionalNumeric(0, 300)
      : requiredNumeric(0, 300, 'Systolic BP is required'),
    bloodPressureDiastolic: isUnderFifteen
      ? optionalNumeric(0, 200)
      : requiredNumeric(0, 200, 'Diastolic BP is required'),
    pulseRate: isUnderFifteen
      ? optionalNumeric(0, 300)
      : requiredNumeric(0, 300, 'Pulse rate is required'),
    temperature: Yup.number()
      .typeError('Must be a number')
      .min(30, 'Temperature must be ≥ 30°C')
      .max(45, 'Temperature must be ≤ 45°C')
      .required('Temperature is required'),
    weight: isUnderFifteen
      ? optionalNumeric(0, 500)
      : requiredNumeric(0, 500, 'Weight is required'),
    height: isUnderFifteen
      ? optionalNumeric(0, 300)
      : requiredNumeric(0, 300, 'Height is required'),
    oxygenSaturation: optionalNumeric(0, 100),
    bloodGlucose: Yup.number().typeError('Must be a number').min(0).nullable().optional(),
    notes: Yup.string().optional(),
  });
}

const INPUT_CLS =
  'h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl';
const SELECT_CLS =
  'h-12 rounded-xl bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50';

function computeBmi(weight: number | string, height: number | string): string {
  const w = parseFloat(String(weight));
  const h = parseFloat(String(height));
  if (!w || !h || h === 0) return '—';
  const bmi = w / Math.pow(h / 100, 2);
  return bmi.toFixed(1);
}

function BmiBadge({ bmi }: { bmi: string }) {
  const value = parseFloat(bmi);
  if (isNaN(value)) return <span className="text-muted-foreground text-sm">—</span>;
  if (value < 18.5)
    return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{bmi} — Underweight</Badge>;
  if (value < 25)
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{bmi} — Normal</Badge>;
  if (value < 30)
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{bmi} — Overweight</Badge>;
  return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{bmi} — Obese</Badge>;
}

export function VitalSignModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  entry,
}: VitalSignModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: patients, isLoadingPatients } = useAppSelector((s) => s.patients);
  const { list: stations, isLoadingStations } = useAppSelector((s) => s.stations);
  const [moveStationId, setMoveStationId] = useState('');
  const submitIntent = useRef<'save' | 'saveAndMove'>('save');

  const isViewOnly = mode === 'view';
  const isPatientLocked = !!initialData?.patient?.firstName;

  const availableStations = entry
    ? stations.filter((s) => (s as any).outreach?.id === entry.outreach.id && s.id !== entry.currentStation?.id)
    : [];

  const patientDob = entry?.patient.dateOfBirth;
  const patientAge = getPatientAgeYears(patientDob);
  const isUnderFifteen = patientAge !== null && patientAge < 15;

  useEffect(() => {
    if (!open) return;
    setMoveStationId('');
    submitIntent.current = 'save';
    if (!isPatientLocked) dispatch(fetchPatients({ limit: 200 }));
    dispatch(fetchStations({ limit: 100 }));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toNum = (v: number | null | undefined) =>
    v != null ? String(v) : '';

  const initialValues = {
    patientId: initialData?.patient?.id || '',
    stationId: initialData?.station?.id || '',
    bloodPressureSystolic: toNum(initialData?.bloodPressureSystolic),
    bloodPressureDiastolic: toNum(initialData?.bloodPressureDiastolic),
    pulseRate: toNum(initialData?.pulseRate),
    temperature: toNum(initialData?.temperature),
    weight: toNum(initialData?.weight),
    height: toNum(initialData?.height),
    oxygenSaturation: toNum(initialData?.oxygenSaturation),
    bloodGlucose: toNum(initialData?.bloodGlucose),
    notes: initialData?.notes || '',
  };

  const sectionLabel = (text: string) => (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3 mt-5">
      {text}
    </p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-[680px] rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Record Vital Signs'}
            {mode === 'edit' && 'Edit Vital Signs'}
            {mode === 'view' && 'Vital Signs Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' && 'Enter the patient vital signs below. BMI is computed automatically.'}
            {mode === 'edit' && 'Update the vital signs record.'}
            {mode === 'view' && 'Viewing recorded vital signs.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={makeSchema(isUnderFifteen)}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            if (isViewOnly) return;
            try {
              const toOptNum = (v: string) => (v !== '' ? Number(v) : undefined);
              const payload = {
                patientId: values.patientId,
                stationId: values.stationId,
                bloodPressureSystolic: isUnderFifteen ? toOptNum(values.bloodPressureSystolic) : Number(values.bloodPressureSystolic),
                bloodPressureDiastolic: isUnderFifteen ? toOptNum(values.bloodPressureDiastolic) : Number(values.bloodPressureDiastolic),
                pulseRate: isUnderFifteen ? toOptNum(values.pulseRate) : Number(values.pulseRate),
                temperature: Number(values.temperature),
                weight: isUnderFifteen ? toOptNum(values.weight) : Number(values.weight),
                height: isUnderFifteen ? toOptNum(values.height) : Number(values.height),
                oxygenSaturation: toOptNum(values.oxygenSaturation),
                bloodGlucose: toOptNum(values.bloodGlucose),
                notes: values.notes || undefined,
              };
              await onSubmit(payload);
              if (submitIntent.current === 'saveAndMove' && entry && moveStationId) {
                await dispatch(moveQueueEntry({ id: entry.id, data: { stationId: moveStationId } })).unwrap();
                toast.success('Patient moved successfully');
                onOpenChange(false);
                router.push('/service-queue');
              } else {
                onOpenChange(false);
              }
            } catch (err: any) {
              toast.error(err?.message || err || 'Failed to save vital signs');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting, submitForm }) => (
            <Form className="space-y-2">

              {/* ── Under-5 notice ────────────────────── */}
              {isUnderFifteen && !isViewOnly && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-300">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>Patient is under 15 — Blood pressure, pulse, weight and height are <strong>optional</strong> for this age group.</span>
                </div>
              )}

              {/* ── Patient & Station ───────────────────── */}
              {sectionLabel('Patient & Station')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/80">Patient</Label>
                  {isPatientLocked ? (
                    <div className="h-12 flex items-center gap-2 px-3 rounded-xl bg-muted/50 border border-border text-sm">
                      <span className="font-medium">{initialData!.patient!.firstName} {initialData!.patient!.lastName}</span>
                      <span className="text-muted-foreground font-mono text-xs">· {initialData!.patient!.registrationNumber}</span>
                    </div>
                  ) : isLoadingPatients ? (
                    <div className="h-12 bg-muted animate-pulse rounded-xl" />
                  ) : (
                    <Select
                      value={values.patientId}
                      onValueChange={(v) => setFieldValue('patientId', v)}
                      disabled={isViewOnly || mode === 'edit'}
                    >
                      <SelectTrigger className={SELECT_CLS}>
                        <SelectValue placeholder="Select patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} — {p.registrationNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <ErrorMessage name="patientId" component="p" className="text-xs text-destructive font-medium" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/80">Station</Label>
                  {isLoadingStations ? (
                    <div className="h-12 bg-muted animate-pulse rounded-xl" />
                  ) : (
                    <Select
                      value={values.stationId}
                      onValueChange={(v) => setFieldValue('stationId', v)}
                      disabled={isViewOnly}
                    >
                      <SelectTrigger className={SELECT_CLS}>
                        <SelectValue placeholder="Select station..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <ErrorMessage name="stationId" component="p" className="text-xs text-destructive font-medium" />
                </div>
              </div>

              {/* ── Blood Pressure & Pulse ──────────────── */}
              {sectionLabel('Cardiovascular')}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bloodPressureSystolic" className="text-sm font-semibold text-foreground/80">
                    Systolic <span className="font-normal text-muted-foreground">(mmHg)</span>
                    {isUnderFifteen && <span className="ml-1 text-xs font-normal text-amber-600">optional</span>}
                  </Label>
                  <Field as={Input} id="bloodPressureSystolic" name="bloodPressureSystolic"
                    type="number" inputMode="numeric" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="bloodPressureSystolic" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bloodPressureDiastolic" className="text-sm font-semibold text-foreground/80">
                    Diastolic <span className="font-normal text-muted-foreground">(mmHg)</span>
                    {isUnderFifteen && <span className="ml-1 text-xs font-normal text-amber-600">optional</span>}
                  </Label>
                  <Field as={Input} id="bloodPressureDiastolic" name="bloodPressureDiastolic"
                    type="number" inputMode="numeric" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="bloodPressureDiastolic" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pulseRate" className="text-sm font-semibold text-foreground/80">
                    Pulse Rate <span className="font-normal text-muted-foreground">(bpm)</span>
                    {isUnderFifteen && <span className="ml-1 text-xs font-normal text-amber-600">optional</span>}
                  </Label>
                  <Field as={Input} id="pulseRate" name="pulseRate"
                    type="number" inputMode="numeric" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="pulseRate" component="p" className="text-xs text-destructive font-medium" />
                </div>
              </div>

              {/* ── Body Measurements ──────────────────── */}
              {sectionLabel('Body Measurements')}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-sm font-semibold text-foreground/80">
                    Weight <span className="font-normal text-muted-foreground">(kg)</span>
                    {isUnderFifteen && <span className="ml-1 text-xs font-normal text-amber-600">optional</span>}
                  </Label>
                  <Field as={Input} id="weight" name="weight"
                    type="number" step="0.1" inputMode="decimal" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="weight" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-sm font-semibold text-foreground/80">
                    Height <span className="font-normal text-muted-foreground">(cm)</span>
                    {isUnderFifteen && <span className="ml-1 text-xs font-normal text-amber-600">optional</span>}
                  </Label>
                  <Field as={Input} id="height" name="height"
                    type="number" step="0.1" inputMode="decimal" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="height" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/80">BMI</Label>
                  <div className="h-12 flex items-center px-3 rounded-xl bg-muted/50 border border-border">
                    <BmiBadge bmi={computeBmi(values.weight, values.height)} />
                  </div>
                </div>
              </div>

              {/* ── Additional Vitals ──────────────────── */}
              {sectionLabel('Additional Vitals (Optional)')}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="temperature" className="text-sm font-semibold text-foreground/80">
                    Temperature <span className="font-normal text-muted-foreground">(°C)</span>
                  </Label>
                  <Field as={Input} id="temperature" name="temperature"
                    type="number" step="0.1" inputMode="decimal" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="temperature" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="oxygenSaturation" className="text-sm font-semibold text-foreground/80">
                    O₂ Saturation <span className="font-normal text-muted-foreground">(%)</span>
                  </Label>
                  <Field as={Input} id="oxygenSaturation" name="oxygenSaturation"
                    type="number" step="0.1" inputMode="decimal" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="oxygenSaturation" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bloodGlucose" className="text-sm font-semibold text-foreground/80">
                    Blood Glucose <span className="font-normal text-muted-foreground">(mmol/L)</span>
                  </Label>
                  <Field as={Input} id="bloodGlucose" name="bloodGlucose"
                    type="number" step="0.1" inputMode="decimal" disabled={isViewOnly} className={INPUT_CLS} />
                  <ErrorMessage name="bloodGlucose" component="p" className="text-xs text-destructive font-medium" />
                </div>
              </div>

              {/* ── Notes ─────────────────────────────── */}
              {sectionLabel('Notes (Optional)')}
              <div className="space-y-1.5">
                <Textarea
                  id="notes"
                  name="notes"
                  value={values.notes}
                  onChange={(e) => setFieldValue('notes', e.target.value)}
                  disabled={isViewOnly}
                  placeholder="Additional clinical observations..."
                  rows={3}
                  className="bg-white/50 dark:bg-black/50 border-border rounded-xl resize-none"
                />
              </div>

              {/* ── Move to station (create/edit mode) ── */}
              {!isViewOnly && entry && (
                <StationMoveSection
                  stations={availableStations}
                  value={moveStationId}
                  onChange={setMoveStationId}
                  currentStationId={entry.currentStation?.id}
                />
              )}

              {/* ── Actions ───────────────────────────── */}
              <div className="pt-4 grid grid-cols-1 sm:flex gap-3 sm:justify-end border-t border-border/50 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-12 w-full sm:w-auto px-6 rounded-xl"
                >
                  {isViewOnly ? 'Close' : 'Cancel'}
                </Button>
                {!isViewOnly && (
                  <>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      variant="outline"
                      onClick={() => { submitIntent.current = 'save'; submitForm(); }}
                      className="h-12 w-full sm:w-auto px-8 rounded-xl"
                    >
                      {isSubmitting && submitIntent.current === 'save' ? 'Saving...' : 'Save Vital Signs'}
                    </Button>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        if (!moveStationId) { toast.error('Select a destination station first'); return; }
                        submitIntent.current = 'saveAndMove';
                        submitForm();
                      }}
                      className="h-12 w-full sm:w-auto px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    >
                      {isSubmitting && submitIntent.current === 'saveAndMove' ? 'Saving...' : 'Save & Move →'}
                    </Button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
