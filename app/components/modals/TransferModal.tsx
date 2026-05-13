'use client';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { useAppDispatch } from '@/app/hooks/redux';
import { createTransfer, updateTransfer } from '@/app/store/transfers';
import { TransferRecord, QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { toast } from 'sonner';

const schema = Yup.object({
  referredToFacility: Yup.string().required('Facility is required'),
  referredService: Yup.string().required('Service is required'),
  transferReason: Yup.string().required('Reason is required'),
  urgency: Yup.string().oneOf(['ROUTINE', 'URGENT', 'EMERGENCY']).required(),
  transportArranged: Yup.boolean(),
  notes: Yup.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  record?: TransferRecord | null;
}

export function TransferModal({ open, onOpenChange, entry, record }: Props) {
  const dispatch = useAppDispatch();
  const isEditing = !!record;

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Referral' : 'Refer to Facility'}</DialogTitle>
          <DialogDescription>
            Transfer {entry.patient.firstName} {entry.patient.lastName} to an external facility
          </DialogDescription>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={{
            referredToFacility: record?.referredToFacility ?? '',
            referredService: record?.referredService ?? '',
            transferReason: record?.transferReason ?? '',
            urgency: (record?.urgency ?? 'ROUTINE') as 'ROUTINE' | 'URGENT' | 'EMERGENCY',
            transportArranged: record?.transportArranged ?? false,
            notes: record?.notes ?? '',
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              if (isEditing) {
                await dispatch(updateTransfer({ id: record.id, data: values })).unwrap();
                toast.success('Referral updated');
              } else {
                await dispatch(createTransfer({
                  queueEntryId: entry.id,
                  patientId: entry.patient.id,
                  outreachId: entry.outreach.id,
                  ...values,
                })).unwrap();
                toast.success('Transfer referral saved');
              }
              resetForm();
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err || `Failed to ${isEditing ? 'update' : 'save'} referral`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }) => (
            <Form className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Facility *</Label>
                  <Field as={Input} name="referredToFacility" placeholder="e.g. District Hospital" className="rounded-xl" />
                  {errors.referredToFacility && touched.referredToFacility && (
                    <p className="text-xs text-destructive">{errors.referredToFacility}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Service *</Label>
                  <Field as={Input} name="referredService" placeholder="e.g. Obstetrics" className="rounded-xl" />
                  {errors.referredService && touched.referredService && (
                    <p className="text-xs text-destructive">{errors.referredService}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Urgency *</Label>
                <Select value={values.urgency} onValueChange={(v) => setFieldValue('urgency', v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROUTINE">Routine</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Transfer Reason *</Label>
                <Field
                  as="textarea"
                  name="transferReason"
                  placeholder="Clinical reason for transfer…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.transferReason && touched.transferReason && (
                  <p className="text-xs text-destructive">{errors.transferReason}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={values.transportArranged}
                  onCheckedChange={(v) => setFieldValue('transportArranged', v)}
                  id="transport"
                />
                <Label htmlFor="transport">Transport arranged</Label>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Field
                  as="textarea"
                  name="notes"
                  placeholder="Additional notes…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-16 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : isEditing ? 'Update Referral' : 'Save Referral'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
