'use client';

import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { createCommunicableDisease, updateCommunicableDisease } from '@/app/store/communicable-diseases';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { CommunicableDiseaseRecord, QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { StationMoveSection } from '@/app/components/modals/shared/StationMoveSection';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const schema = Yup.object({
  tuberculosisScreen: Yup.boolean(),
  tuberculosisNotes: Yup.string().optional(),
  malariaScreen: Yup.boolean(),
  hasFever: Yup.boolean(),
  feverDurationDays: Yup.number().integer().min(0).nullable().optional(),
  recentTravel: Yup.boolean(),
  contactWithInfected: Yup.boolean(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  record?: CommunicableDiseaseRecord | null;
}

export function CommunicableDiseaseModal({ open, onOpenChange, entry, record }: Props) {
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
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-[500px] rounded-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto overscroll-contain p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Disease Screening' : 'Disease Screening'}</DialogTitle>
          <DialogDescription>
            Communicable disease screening for {entry.patient.firstName} {entry.patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={{
            tuberculosisScreen: record?.tuberculosisScreen ?? false,
            tuberculosisNotes: record?.tuberculosisNotes ?? '',
            malariaScreen: record?.malariaScreen ?? false,
            hasFever: record?.hasFever ?? false,
            feverDurationDays: record?.feverDurationDays?.toString() ?? '',
            recentTravel: record?.recentTravel ?? false,
            contactWithInfected: record?.contactWithInfected ?? false,
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const payload = {
                ...values,
                feverDurationDays: values.feverDurationDays ? Number(values.feverDurationDays) : undefined,
              };
              if (isEditing) {
                await dispatch(updateCommunicableDisease({ id: record.id, data: payload })).unwrap();
                toast.success('Screening updated');
              } else {
                await dispatch(createCommunicableDisease({
                  queueEntryId: entry.id,
                  patientId: entry.patient.id,
                  outreachId: entry.outreach.id,
                  ...payload,
                })).unwrap();
                toast.success('Screening saved');
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
            } catch (err: any) {
              toast.error(err || `Failed to ${isEditing ? 'update' : 'save'} screening`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, submitForm }) => (
            <Form className="space-y-5 pt-2">
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-medium">Tuberculosis</p>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={values.tuberculosisScreen}
                    onCheckedChange={(v) => setFieldValue('tuberculosisScreen', v)}
                    id="tbScreen"
                  />
                  <Label htmlFor="tbScreen">TB symptoms present</Label>
                </div>
                {values.tuberculosisScreen && (
                  <div className="space-y-1.5">
                    <Label>TB Notes</Label>
                    <Field
                      as="textarea"
                      name="tuberculosisNotes"
                      placeholder="Describe symptoms…"
                      className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-16 outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-medium">Malaria & Fever</p>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={values.malariaScreen}
                    onCheckedChange={(v) => setFieldValue('malariaScreen', v)}
                    id="malariaScreen"
                  />
                  <Label htmlFor="malariaScreen">Malaria symptoms present</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={values.hasFever}
                    onCheckedChange={(v) => setFieldValue('hasFever', v)}
                    id="hasFever"
                  />
                  <Label htmlFor="hasFever">Patient has fever</Label>
                </div>
                {values.hasFever && (
                  <div className="space-y-1.5">
                    <Label>Fever duration (days)</Label>
                    <Field as={Input} type="number" name="feverDurationDays" min={0} placeholder="e.g. 3" className="rounded-xl" />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-medium">Exposure History</p>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={values.recentTravel}
                    onCheckedChange={(v) => setFieldValue('recentTravel', v)}
                    id="recentTravel"
                  />
                  <Label htmlFor="recentTravel">Recent travel to affected area</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={values.contactWithInfected}
                    onCheckedChange={(v) => setFieldValue('contactWithInfected', v)}
                    id="contactWithInfected"
                  />
                  <Label htmlFor="contactWithInfected">Contact with infected person</Label>
                </div>
              </div>

              {!isEditing && (
                <StationMoveSection
                  stations={availableStations}
                  value={moveStationId}
                  onChange={setMoveStationId}
                  currentStationId={entry.currentStation?.id}
                />
              )}
              <div className="grid grid-cols-1 gap-2 pt-1 sm:flex sm:justify-end">
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                  onClick={() => { submitIntent.current = 'save'; submitForm(); }}>
                  {isSubmitting && submitIntent.current === 'save' ? 'Saving…' : isEditing ? 'Update Screening' : 'Save Screening'}
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
