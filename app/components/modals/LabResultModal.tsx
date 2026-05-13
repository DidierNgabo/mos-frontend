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
import { createLabResult, updateLabResult } from '@/app/store/lab-results';
import { LabResultRecord, QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { toast } from 'sonner';

const LAB_TEST_TYPES = [
  { value: 'HIV', label: 'HIV' },
  { value: 'HEPATITIS_B', label: 'Hepatitis B' },
  { value: 'HEPATITIS_C', label: 'Hepatitis C' },
  { value: 'MALARIA_RDT', label: 'Malaria RDT' },
  { value: 'BLOOD_GLUCOSE', label: 'Blood Glucose' },
  { value: 'HEMOGLOBIN', label: 'Hemoglobin' },
  { value: 'URINALYSIS', label: 'Urinalysis' },
  { value: 'OTHER', label: 'Other' },
];

const schema = Yup.object({
  testType: Yup.string().required('Test type is required'),
  resultValue: Yup.string().required('Result is required'),
  resultUnit: Yup.string().optional(),
  isAbnormal: Yup.boolean(),
  notes: Yup.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  record?: LabResultRecord | null;
}

export function LabResultModal({ open, onOpenChange, entry, record }: Props) {
  const dispatch = useAppDispatch();
  const isEditing = !!record;

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lab Result' : 'Add Lab Result'}</DialogTitle>
          <DialogDescription>
            Record lab result for {entry.patient.firstName} {entry.patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={{
            testType: record?.testType ?? '',
            resultValue: record?.resultValue ?? '',
            resultUnit: record?.resultUnit ?? '',
            isAbnormal: record?.isAbnormal ?? false,
            notes: record?.notes ?? '',
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              if (isEditing) {
                await dispatch(updateLabResult({ id: record.id, data: values })).unwrap();
                toast.success('Lab result updated');
              } else {
                await dispatch(createLabResult({
                  queueEntryId: entry.id,
                  patientId: entry.patient.id,
                  stationId: entry.currentStation?.id || '',
                  outreachId: entry.outreach.id,
                  ...values,
                })).unwrap();
                toast.success('Lab result saved');
              }
              resetForm();
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err || `Failed to ${isEditing ? 'update' : 'save'} lab result`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }) => (
            <Form className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Test Type *</Label>
                <Select value={values.testType} onValueChange={(v) => setFieldValue('testType', v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select test" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_TEST_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.testType && touched.testType && (
                  <p className="text-xs text-destructive">{errors.testType}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Result *</Label>
                  <Field as={Input} name="resultValue" placeholder="e.g. Reactive, 5.2" className="rounded-xl" />
                  {errors.resultValue && touched.resultValue && (
                    <p className="text-xs text-destructive">{errors.resultValue}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Field as={Input} name="resultUnit" placeholder="e.g. mmol/L" className="rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={values.isAbnormal}
                  onCheckedChange={(v) => setFieldValue('isAbnormal', v)}
                  id="abnormal"
                />
                <Label htmlFor="abnormal">Abnormal result</Label>
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
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : isEditing ? 'Update Result' : 'Save Result'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
