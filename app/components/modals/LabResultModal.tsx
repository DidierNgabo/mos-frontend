'use client';

import { useEffect, useRef, useState } from 'react';
import { FieldArray, Formik, Form, Field } from 'formik';
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
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { bulkCreateLabResult, updateLabResult } from '@/app/store/lab-results';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { LabResultRecord, QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { StationMoveSection } from '@/app/components/modals/shared/StationMoveSection';
import { useRouter } from 'next/navigation';
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

const itemSchema = Yup.object({
  testType: Yup.string().required('Test type is required'),
  resultValue: Yup.string().required('Result is required'),
  resultUnit: Yup.string().optional(),
  isAbnormal: Yup.boolean(),
  notes: Yup.string().optional(),
});

const editSchema = itemSchema;

const bulkSchema = Yup.object({
  results: Yup.array().of(itemSchema).min(1),
});

const emptyItem = () => ({
  testType: '',
  resultValue: '',
  resultUnit: '',
  isAbnormal: false,
  notes: '',
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  record?: LabResultRecord | null;
}

export function LabResultModal({ open, onOpenChange, entry, record }: Props) {
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

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-120 rounded-2xl max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Lab Result</DialogTitle>
            <DialogDescription>
              Update lab result for {entry.patient.firstName} {entry.patient.lastName}
            </DialogDescription>
          </DialogHeader>
          <Formik
            enableReinitialize
            initialValues={{
              testType: record.testType ?? '',
              resultValue: record.resultValue ?? '',
              resultUnit: record.resultUnit ?? '',
              isAbnormal: record.isAbnormal ?? false,
              notes: record.notes ?? '',
            }}
            validationSchema={editSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await dispatch(updateLabResult({ id: record.id, data: values })).unwrap();
                toast.success('Lab result updated');
                onOpenChange(false);
              } catch (err: any) {
                toast.error(err || 'Failed to update lab result');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values, setFieldValue, errors, touched }) => (
              <Form className="space-y-4 pt-2">
                <TestItemFields
                  prefix=""
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                />
                <div className="grid grid-cols-1 gap-2 pt-2 sm:flex sm:justify-end">
                  <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Update Result'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-140 rounded-2xl max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Add Lab Results</DialogTitle>
          <DialogDescription>
            Record lab results for {entry.patient.firstName} {entry.patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{ results: [emptyItem()] }}
          validationSchema={bulkSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await dispatch(bulkCreateLabResult({
                queueEntryId: entry.id,
                patientId: entry.patient.id,
                stationId: entry.currentStation?.id || undefined,
                outreachId: entry.outreach.id,
                results: values.results,
              })).unwrap();
              toast.success(`${values.results.length} lab result${values.results.length > 1 ? 's' : ''} saved`);
              resetForm();
              if (submitIntent.current === 'saveAndMove' && moveStationId) {
                await dispatch(moveQueueEntry({ id: entry.id, data: { stationId: moveStationId } })).unwrap();
                toast.success('Patient moved successfully');
                onOpenChange(false);
                router.push('/service-queue');
              } else {
                onOpenChange(false);
              }
            } catch (err: any) {
              toast.error(err || 'Failed to save lab results');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched, submitForm }) => (
            <Form className="space-y-3 pt-2">
              <FieldArray name="results">
                {(arrayHelpers) => (
                  <>
                    {values.results.map((_, index) => {
                      const itemErrors = (errors.results as any)?.[index] ?? {};
                      const itemTouched = (touched.results as any)?.[index] ?? {};
                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 relative"
                        >
                          {values.results.length > 1 && (
                            <button
                              type="button"
                              onClick={() => arrayHelpers.remove(index)}
                              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors text-sm leading-none"
                              aria-label="Remove test"
                            >
                              ✕
                            </button>
                          )}
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Test {index + 1}
                          </p>
                          <TestItemFields
                            prefix={`results[${index}].`}
                            values={values.results[index]}
                            errors={itemErrors}
                            touched={itemTouched}
                            setFieldValue={(field, value) =>
                              setFieldValue(`results[${index}].${field}`, value)
                            }
                          />
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl border-dashed"
                      onClick={() => arrayHelpers.push(emptyItem())}
                    >
                      + Add another test
                    </Button>
                  </>
                )}
              </FieldArray>
              <StationMoveSection
                stations={availableStations}
                value={moveStationId}
                onChange={setMoveStationId}
                currentStationId={entry.currentStation?.id}
              />
              <div className="grid grid-cols-1 gap-2 pt-2 sm:flex sm:justify-end">
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                  onClick={() => { submitIntent.current = 'save'; submitForm(); }}>
                  {isSubmitting && submitIntent.current === 'save' ? 'Saving…' : `Save ${values.results.length > 1 ? `All ${values.results.length} Results` : 'Result'}`}
                </Button>
                <Button type="button" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                  onClick={() => {
                    if (!moveStationId) { toast.error('Select a destination station first'); return; }
                    submitIntent.current = 'saveAndMove';
                    submitForm();
                  }}>
                  {isSubmitting && submitIntent.current === 'saveAndMove' ? 'Saving…' : 'Save & Move →'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

interface TestItemFieldsProps {
  prefix: string;
  values: {
    testType: string;
    resultValue: string;
    resultUnit: string;
    isAbnormal: boolean;
    notes: string;
  };
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: any) => void;
}

function TestItemFields({ prefix, values, errors, touched, setFieldValue }: TestItemFieldsProps) {
  return (
    <>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Result *</Label>
          <Field as={Input} name={`${prefix}resultValue`} placeholder="e.g. Reactive, 5.2" className="rounded-xl" />
          {errors.resultValue && touched.resultValue && (
            <p className="text-xs text-destructive">{errors.resultValue}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Unit</Label>
          <Field as={Input} name={`${prefix}resultUnit`} placeholder="e.g. mmol/L" className="rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={values.isAbnormal}
          onCheckedChange={(v) => setFieldValue('isAbnormal', v)}
          id={`${prefix}abnormal`}
        />
        <Label htmlFor={`${prefix}abnormal`}>Abnormal result</Label>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Field
          as="textarea"
          name={`${prefix}notes`}
          placeholder="Additional notes…"
          className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-16 outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
    </>
  );
}
