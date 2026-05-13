'use client';

import { useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { toast } from 'sonner';

const schema = Yup.object({
  stationId: Yup.string().required('Destination station is required'),
  reason: Yup.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  onSuccess: () => void;
}

export function MovePatientModal({ open, onOpenChange, entry, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const { list: allStations } = useAppSelector((s) => s.stations);

  useEffect(() => {
    if (open && entry) {
      dispatch(fetchStations({ outreachId: entry.outreach.id, isActive: true, limit: 100 }));
    }
  }, [open, entry, dispatch]);

  if (!entry) return null;

  const stations = allStations.filter((s) => s.outreach.id === entry.outreach.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Move Patient</DialogTitle>
          <DialogDescription>
            Move <strong>{entry.patient.firstName} {entry.patient.lastName}</strong> to another station.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{ stationId: '', reason: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await dispatch(moveQueueEntry({ id: entry.id, data: values })).unwrap();
              toast.success('Patient moved successfully');
              resetForm();
              onSuccess();
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err || 'Failed to move patient');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }) => (
            <Form className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Destination Station *</Label>
                <Select value={values.stationId} onValueChange={(v) => setFieldValue('stationId', v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations
                      .filter((s) => s.id !== entry.currentStation?.id)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.type})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.stationId && touched.stationId && (
                  <p className="text-xs text-destructive">{errors.stationId}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Field
                  as="textarea"
                  name="reason"
                  placeholder="Reason for moving…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Moving…' : 'Move Patient'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
