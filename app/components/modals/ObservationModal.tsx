'use client';

import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { createObservation, updateObservation } from '@/app/store/observations';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { ObservationRecord, QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { StationMoveSection } from '@/app/components/modals/shared/StationMoveSection';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DiagnosisCombobox } from '@/app/components/observations/DiagnosisCombobox';

const schema = Yup.object({
  chiefComplaint: Yup.string().required('Chief complaint is required'),
  diagnosis: Yup.string().required('Diagnosis is required'),
  diagnosisCode: Yup.string().nullable(),
  treatmentGiven: Yup.string().optional(),
  followUpRequired: Yup.boolean(),
  followUpNotes: Yup.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  record?: ObservationRecord | null;
}

export function ObservationModal({ open, onOpenChange, entry, record }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: allStations } = useAppSelector((s) => s.stations);
  const [moveStationId, setMoveStationId] = useState('');
  const submitIntent = useRef<'save' | 'saveAndMove'>('save');
  const isEditing = !!record;

  const availableStations = entry
    ? allStations.filter((s) => (s as any).outreach?.id === entry.outreach.id && s.id !== entry.currentStation?.id)
    : [];

  useEffect(() => {
    if (!open || !entry) return;
    setMoveStationId('');
    submitIntent.current = 'save';
    dispatch(fetchStations({ outreachId: entry.outreach.id, isActive: true, limit: 100 }));
  }, [open, entry, dispatch]);

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-[540px] rounded-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto overscroll-contain p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Observation' : 'Add Observation'}</DialogTitle>
          <DialogDescription>
            Clinical notes for {entry.patient.firstName} {entry.patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={{
            chiefComplaint: record?.chiefComplaint ?? (entry.chiefComplaint || ''),
            diagnosis: record?.diagnosis ?? '',
            diagnosisCode: record
              ? (record.diagnosisCode ?? null)
              : ('' as string | null),
            treatmentGiven: record?.treatmentGiven ?? '',
            followUpRequired: record?.followUpRequired ?? false,
            followUpNotes: record?.followUpNotes ?? '',
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              if (isEditing) {
                await dispatch(updateObservation({ id: record.id, data: values })).unwrap();
                toast.success('Observation updated');
              } else {
                await dispatch(createObservation({
                  queueEntryId: entry.id,
                  patientId: entry.patient.id,
                  stationId: entry.currentStation?.id || '',
                  outreachId: entry.outreach.id,
                  ...values,
                })).unwrap();
                toast.success('Observation saved');
              }
              resetForm();
              if (submitIntent.current === 'saveAndMove' && !isEditing && moveStationId) {
                await dispatch(moveQueueEntry({ id: entry.id, data: { stationId: moveStationId } })).unwrap();
                toast.success('Patient moved successfully');
                onOpenChange(false);
                router.push('/service-queue');
              } else {
                onOpenChange(false);
              }
            } catch (error: unknown) {
              toast.error(
                typeof error === 'string'
                  ? error
                  : `Failed to ${isEditing ? 'update' : 'save'} observation`,
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched, submitForm }) => (
            <Form className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Chief Complaint *</Label>
                <Field
                  as="textarea"
                  name="chiefComplaint"
                  placeholder="Main reason for visit…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.chiefComplaint && touched.chiefComplaint && (
                  <p className="text-xs text-destructive">
                    {errors.chiefComplaint}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Diagnosis *</Label>
                <DiagnosisCombobox
                  code={values.diagnosisCode}
                  title={values.diagnosis}
                  hasError={!!(errors.diagnosis && touched.diagnosis)}
                  onChange={(diagnosis) => {
                    if (diagnosis) {
                      setFieldValue('diagnosisCode', diagnosis.code);
                      setFieldValue('diagnosis', diagnosis.title);
                    } else {
                      setFieldValue('diagnosisCode', null);
                      setFieldValue('diagnosis', '');
                    }
                  }}
                />
                {values.diagnosisCode === null && (
                  <Field
                    as="textarea"
                    name="diagnosis"
                    placeholder="Enter clinical diagnosis…"
                    className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                )}
                {errors.diagnosis && touched.diagnosis && (
                  <p className="text-xs text-destructive">
                    {errors.diagnosis}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Treatment Given</Label>
                <Field
                  as="textarea"
                  name="treatmentGiven"
                  placeholder="Treatment provided (optional)…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={values.followUpRequired}
                  onCheckedChange={(v) => setFieldValue('followUpRequired', v)}
                  id="followUp"
                />
                <Label htmlFor="followUp">Follow-up required</Label>
              </div>
              {values.followUpRequired && (
                <div className="space-y-1.5">
                  <Label>Follow-up Notes</Label>
                  <Field
                    as="textarea"
                    name="followUpNotes"
                    placeholder="Follow-up instructions…"
                    className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-16 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}
              {!isEditing && (
                <StationMoveSection
                  stations={availableStations}
                  value={moveStationId}
                  onChange={setMoveStationId}
                  currentStationId={entry.currentStation?.id}
                />
              )}
              <div className="grid grid-cols-1 gap-2 pt-2 sm:flex sm:justify-end">
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                  onClick={() => { submitIntent.current = 'save'; submitForm(); }}>
                  {isSubmitting && submitIntent.current === 'save' ? 'Saving…' : isEditing ? 'Update Observation' : 'Save Observation'}
                </Button>
                {!isEditing && (
                  <Button type="button" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                    onClick={() => {
                      if (!moveStationId) { toast.error('Select a destination station first'); return; }
                      submitIntent.current = 'saveAndMove';
                      submitForm();
                    }}>
                    {isSubmitting && submitIntent.current === 'saveAndMove' ? 'Saving…' : 'Save & Move →'}
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
