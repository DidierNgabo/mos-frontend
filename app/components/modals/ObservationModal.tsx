'use client';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { useAppDispatch } from '@/app/hooks/redux';
import { createObservation, updateObservation } from '@/app/store/observations';
import { ObservationRecord, QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { toast } from 'sonner';

const schema = Yup.object({
  chiefComplaint: Yup.string().required('Chief complaint is required'),
  diagnosis: Yup.string().required('Diagnosis is required'),
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
  const isEditing = !!record;

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] rounded-2xl max-h-[90vh] overflow-y-auto">
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
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err || `Failed to ${isEditing ? 'update' : 'save'} observation`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }) => (
            <Form className="space-y-4 pt-2">
              {[
                { name: 'chiefComplaint', label: 'Chief Complaint *', placeholder: 'Main reason for visit…' },
                { name: 'diagnosis', label: 'Diagnosis *', placeholder: 'Clinical diagnosis…' },
                { name: 'treatmentGiven', label: 'Treatment Given', placeholder: 'Treatment provided (optional)…' },
              ].map(({ name, label, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Field
                    as="textarea"
                    name={name}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {(errors as any)[name] && (touched as any)[name] && (
                    <p className="text-xs text-destructive">{(errors as any)[name]}</p>
                  )}
                </div>
              ))}
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
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : isEditing ? 'Update Observation' : 'Save Observation'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
