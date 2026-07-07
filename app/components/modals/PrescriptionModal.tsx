'use client';

import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchPharmacyStocks } from '@/app/store/pharmacy-stock';
import { createPrescription } from '@/app/store/prescriptions';
import { moveQueueEntry } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { QueueEntry } from '@/app/store/queue-entries/queue-entries.types';
import { StationMoveSection } from '@/app/components/modals/shared/StationMoveSection';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Mode = 'pharmacy' | 'custom';

const makeSchema = (mode: Mode) =>
  Yup.object({
    pharmacyStockId: mode === 'pharmacy'
      ? Yup.string().required('Select a medication')
      : Yup.string().optional(),
    customMedicationName: mode === 'custom'
      ? Yup.string().required('Enter medication name').min(2, 'Name is too short')
      : Yup.string().optional(),
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
  const router = useRouter();
  const { list: stocks, isLoadingPharmacyStocks } = useAppSelector((s) => s.pharmacyStock);
  const { list: allStations } = useAppSelector((s) => s.stations);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('pharmacy');
  const [moveStationId, setMoveStationId] = useState('');
  const submitIntent = useRef<'save' | 'saveAndMove'>('save');

  const availableStations = entry
    ? allStations.filter((s) => (s as any).outreach?.id === entry.outreach.id && s.id !== entry.currentStation?.id)
    : [];

  useEffect(() => {
    if (open) {
      setMode('pharmacy');
      setSearch('');
      setMoveStationId('');
      submitIntent.current = 'save';
      if (activeOutreachId) {
        dispatch(fetchPharmacyStocks({ outreachId: activeOutreachId, isActive: true, limit: 100 }));
      }
      if (entry) {
        dispatch(fetchStations({ outreachId: entry.outreach.id, isActive: true, limit: 100 }));
      }
    }
  }, [open, activeOutreachId, entry, dispatch]);

  const filtered = stocks.filter((s) =>
    s.medicationName.toLowerCase().includes(search.toLowerCase()) ||
    s.genericName.toLowerCase().includes(search.toLowerCase()),
  );

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-[520px] rounded-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto overscroll-contain p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Prescribe Medication</DialogTitle>
          <DialogDescription>
            Recommend a medication for {entry.patient.firstName} {entry.patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{ pharmacyStockId: '', customMedicationName: '', dosage: '', quantity: 1, instructions: '' }}
          validationSchema={makeSchema(mode)}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const payload: Record<string, unknown> = {
                queueEntryId: entry.id,
                patientId: entry.patient.id,
                outreachId: entry.outreach.id,
                dosage: values.dosage,
                quantity: Number(values.quantity),
                instructions: values.instructions || undefined,
              };
              if (mode === 'pharmacy') {
                payload.pharmacyStockId = values.pharmacyStockId;
              } else {
                payload.customMedicationName = values.customMedicationName;
              }
              await dispatch(createPrescription(payload)).unwrap();
              toast.success('Prescription created');
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
              toast.error(err || 'Failed to create prescription');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched, submitForm }) => (
            <Form className="space-y-4 pt-2">

              {/* Mode toggle */}
              <div className="flex rounded-xl border border-border overflow-hidden text-sm font-medium">
                <button
                  type="button"
                  onClick={() => { setMode('pharmacy'); setFieldValue('customMedicationName', ''); }}
                  className={`flex-1 py-2 transition-colors ${mode === 'pharmacy' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted/50'}`}
                >
                  From Pharmacy
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('custom'); setFieldValue('pharmacyStockId', ''); }}
                  className={`flex-1 py-2 transition-colors ${mode === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted/50'}`}
                >
                  Custom / External
                </button>
              </div>

              {/* Medication field — pharmacy mode */}
              {mode === 'pharmacy' && (
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
                            <div className="flex items-start gap-2 w-full">
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium">{s.medicationName} {s.strength}</span>
                                <span className="text-xs text-muted-foreground">
                                  {s.genericName} · {s.dosageForm} · {s.quantityInStock} {s.unitOfMeasure} in stock
                                </span>
                              </div>
                              {s.quantityInStock === 0 && (
                                <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0">
                                  Out of stock
                                </Badge>
                              )}
                              {s.quantityInStock > 0 && s.isLowStock && (
                                <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 border-amber-400 text-amber-600">
                                  Low stock
                                </Badge>
                              )}
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
              )}

              {/* Medication field — custom mode */}
              {mode === 'custom' && (
                <div className="space-y-1.5">
                  <Label>Medication Name *</Label>
                  <Field
                    name="customMedicationName"
                    placeholder="e.g. Ibuprofen 400mg"
                    className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-muted-foreground">Patient will purchase this externally — no stock will be deducted.</p>
                  {errors.customMedicationName && touched.customMedicationName && (
                    <p className="text-xs text-destructive">{errors.customMedicationName as string}</p>
                  )}
                </div>
              )}

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

              <StationMoveSection
                stations={availableStations}
                value={moveStationId}
                onChange={setMoveStationId}
                currentStationId={entry.currentStation?.id}
              />
              <div className="grid grid-cols-1 gap-2 pt-2 sm:flex sm:justify-end">
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                  onClick={() => { submitIntent.current = 'save'; submitForm(); }}>
                  {isSubmitting && submitIntent.current === 'save' ? 'Saving…' : 'Prescribe'}
                </Button>
                <Button type="button" className="h-11 w-full rounded-xl sm:w-auto" disabled={isSubmitting}
                  onClick={() => {
                    if (!moveStationId) { toast.error('Select a destination station first'); return; }
                    submitIntent.current = 'saveAndMove';
                    submitForm();
                  }}>
                  {isSubmitting && submitIntent.current === 'saveAndMove' ? 'Saving…' : 'Prescribe & Move →'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
