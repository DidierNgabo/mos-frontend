'use client';

import { useEffect } from 'react';
import { Formik, Form } from 'formik';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchOutreaches } from '@/app/store/outreaches';
import { fetchPatients } from '@/app/store/patients';
import { EvangelismRecord } from '@/app/store/evangelism-records/evangelism-records.types';
import {
  EvangelismRecordFormFields,
  buildEvangelismRecordPayload,
  evangelismRecordSchema,
  getEvangelismRecordInitialValues,
} from '@/app/components/evangelism/EvangelismRecordFormFields';
import { toast } from 'sonner';

interface EvangelismRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: EvangelismRecord | null;
  onSubmit: (values: ReturnType<typeof buildEvangelismRecordPayload>) => Promise<void>;
}

export function EvangelismRecordModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: EvangelismRecordModalProps) {
  const dispatch = useAppDispatch();
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { list: patients, isLoadingPatients } = useAppSelector((s) => s.patients);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const isViewOnly = mode === 'view';
  const isEditing = mode === 'edit';

  useEffect(() => {
    if (!open) return;
    dispatch(fetchOutreaches({ limit: 100 }));
    dispatch(fetchPatients({ limit: 200 }));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const initialValues = getEvangelismRecordInitialValues(initialData, activeOutreachId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'New Evangelism Record'}
            {mode === 'edit' && 'Edit Evangelism Record'}
            {mode === 'view' && 'Evangelism Record Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' &&
              'Capture the details of a person who was evangelized.'}
            {mode === 'edit' && 'Update this evangelism record.'}
            {mode === 'view' && 'Viewing evangelism record details.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={evangelismRecordSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            if (isViewOnly) return;
            try {
              await onSubmit(buildEvangelismRecordPayload(values));
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err?.message || err || 'Failed to save evangelism record');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-2">
              <EvangelismRecordFormFields
                values={values}
                setFieldValue={setFieldValue}
                isViewOnly={isViewOnly}
                isEditing={isEditing}
                outreaches={outreaches}
                patients={patients}
                isLoadingPatients={isLoadingPatients}
              />

              {/* ── Actions ───────────────────────────── */}
              <div className="pt-4 flex gap-3 justify-end border-t border-border/50 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-12 px-6 rounded-xl"
                >
                  {isViewOnly ? 'Close' : 'Cancel'}
                </Button>
                {!isViewOnly && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Record'}
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
