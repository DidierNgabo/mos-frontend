'use client';

import { useEffect, useState } from 'react';
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
import { fetchPharmacyStocks } from '@/app/store/pharmacy-stock';
import { createPrescription } from '@/app/store/prescriptions';
import { QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { toast } from 'sonner';

const schema = Yup.object({
  pharmacyStockId: Yup.string().required('Select a medication'),
  dosage: Yup.string().required('Dosage is required'),
  quantity: Yup.number().positive('Must be positive').integer().required('Quantity is required'),
  instructions: Yup.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
}

export function PrescriptionModal({ open, onOpenChange, entry }: Props) {
  const dispatch = useAppDispatch();
  const { list: stocks, isLoadingPharmacyStocks } = useAppSelector((s) => s.pharmacyStock);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && activeOutreachId) {
      dispatch(fetchPharmacyStocks({ outreachId: activeOutreachId, isActive: true, limit: 100 }));
    }
  }, [open, activeOutreachId, dispatch]);

  const filtered = stocks.filter((s) =>
    s.medicationName.toLowerCase().includes(search.toLowerCase()) ||
    s.genericName.toLowerCase().includes(search.toLowerCase()),
  );

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prescribe Medication</DialogTitle>
          <DialogDescription>
            Recommend a medication for {entry.patient.firstName} {entry.patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{ pharmacyStockId: '', dosage: '', quantity: 1, instructions: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await dispatch(createPrescription({
                queueEntryId: entry.id,
                patientId: entry.patient.id,
                outreachId: entry.outreach.id,
                ...values,
                quantity: Number(values.quantity),
              })).unwrap();
              toast.success('Prescription created');
              resetForm();
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err || 'Failed to create prescription');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }) => (
            <Form className="space-y-4 pt-2">
              {/* Medication search + select */}
              <div className="space-y-1.5">
                <Label>Medication *</Label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search medications…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 mb-1"
                />
                {isLoadingPharmacyStocks ? (
                  <p className="text-sm text-muted-foreground px-1">Loading…</p>
                ) : (
                  <Select value={values.pharmacyStockId} onValueChange={(v) => setFieldValue('pharmacyStockId', v)}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {filtered.length === 0 && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">No medications found</p>
                      )}
                      {filtered.map((s) => (
                        <SelectItem key={s.id} value={s.id} disabled={s.quantityInStock === 0}>
                          <div className="flex flex-col">
                            <span className="font-medium">{s.medicationName} {s.strength}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.genericName} · {s.dosageForm} · {s.quantityInStock} {s.unitOfMeasure} in stock
                              {s.quantityInStock === 0 && ' · Out of stock'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.pharmacyStockId && touched.pharmacyStockId && (
                  <p className="text-xs text-destructive">{errors.pharmacyStockId}</p>
                )}
              </div>

              {/* Dosage */}
              <div className="space-y-1.5">
                <Label>Dosage *</Label>
                <Field
                  name="dosage"
                  placeholder="e.g. 500mg twice daily"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.dosage && touched.dosage && (
                  <p className="text-xs text-destructive">{errors.dosage}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label>Quantity *</Label>
                <Field
                  name="quantity"
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.quantity && touched.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity as string}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <Label>Instructions</Label>
                <Field
                  as="textarea"
                  name="instructions"
                  placeholder="e.g. Take after meals…"
                  className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-16 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Prescribe'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
