'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchOutreaches } from '@/app/store/outreaches';
import { PharmacyStock, StockTransaction } from '@/app/store/pharmacy-stock/pharmacy-stock.types';
import { PharmacyStockSource } from '@/app/source';

const ADMIN_ROLES = ['SUPER_ADMIN', 'OUTREACH_ADMIN'];

const DOSAGE_FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'DROPS', 'POWDER', 'SUPPOSITORY', 'INHALER'] as const;

const UNITS_OF_MEASURE = ['Tablets', 'Capsules', 'ml', 'mg', 'g', 'Vials', 'Ampoules', 'Sachets', 'Units', 'Drops', 'Patches', 'Inhalers'] as const;

const CATEGORIES = [
  'Analgesic', 'Antibiotic', 'Antifungal', 'Antiviral', 'Antiparasitic',
  'Antihistamine', 'Antihypertensive', 'Antidiabetic', 'Cardiovascular',
  'Dermatological', 'Gastrointestinal', 'Respiratory', 'Vitamins & Supplements',
  'Vaccines', 'Contraceptive', 'Ophthalmic', 'Neurological', 'Psychiatric',
  'Antiseptic', 'Other',
] as const;

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  RESTOCK: 'Restock',
  DISPENSE: 'Dispense',
  ADJUSTMENT: 'Adjustment',
  EXPIRY_REMOVAL: 'Expiry Removal',
  RETURN: 'Return',
};

const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  RESTOCK: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  DISPENSE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ADJUSTMENT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  EXPIRY_REMOVAL: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  RETURN: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

interface PharmacyStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: PharmacyStock | null;
  onSubmit: (values: any) => Promise<void>;
}

const schema = Yup.object({
  outreachId: Yup.string().required('Outreach is required'),
  medicationName: Yup.string().required('Medication name is required'),
  genericName: Yup.string().required('Generic name is required'),
  dosageForm: Yup.string().required('Dosage form is required'),
  strength: Yup.string().required('Strength is required'),
  unitOfMeasure: Yup.string().required('Unit of measure is required'),
  quantityInStock: Yup.number().integer().min(0, 'Must be ≥ 0').required('Quantity is required'),
  lowStockThreshold: Yup.number().integer().min(0, 'Must be ≥ 0').required('Low stock threshold is required'),
  category: Yup.string().optional(),
  manufacturer: Yup.string().optional(),
  batchNumber: Yup.string().optional(),
  expiryDate: Yup.string().optional(),
  isActive: Yup.boolean(),
});

export function PharmacyStockModal({ open, onOpenChange, mode, initialData, onSubmit }: PharmacyStockModalProps) {
  const dispatch = useAppDispatch();
  const { list: outreaches, isLoadingOutreaches } = useAppSelector((s) => s.outreaches);
  const { activeOutreach } = useAppSelector((s) => s.outreachContext);
  const { user } = useAppSelector((s) => s.auth);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const isAdmin = user?.roles?.some((r: string) => ADMIN_ROLES.includes(r)) ?? false;

  useEffect(() => {
    if (open && isAdmin) dispatch(fetchOutreaches({ limit: 100 }));
  }, [open, isAdmin, dispatch]);

  useEffect(() => {
    if (open && mode === 'view' && initialData?.id) {
      setIsLoadingTransactions(true);
      PharmacyStockSource.fetchStockTransactionsRequest(initialData.id, { limit: 10 })
        .then((res: any) => setTransactions(res?.items || []))
        .catch(() => setTransactions([]))
        .finally(() => setIsLoadingTransactions(false));
    } else {
      setTransactions([]);
    }
  }, [open, mode, initialData?.id]);

  const isViewOnly = mode === 'view';

  const initialValues = {
    outreachId: initialData?.outreach?.id || (!isAdmin && activeOutreach ? activeOutreach.id : ''),
    medicationName: initialData?.medicationName || '',
    genericName: initialData?.genericName || '',
    dosageForm: initialData?.dosageForm || '',
    strength: initialData?.strength || '',
    unitOfMeasure: initialData?.unitOfMeasure || '',
    quantityInStock: initialData?.quantityInStock ?? 0,
    lowStockThreshold: initialData?.lowStockThreshold ?? 10,
    category: initialData?.category || '',
    manufacturer: initialData?.manufacturer || '',
    batchNumber: initialData?.batchNumber || '',
    expiryDate: initialData?.expiryDate ? initialData.expiryDate.substring(0, 10) : '',
    isActive: initialData?.isActive ?? true,
  };

  const fieldClass = 'h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl';
  const labelClass = 'text-sm font-semibold text-foreground/80';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Add Medication'}
            {mode === 'edit' && 'Edit Medication'}
            {mode === 'view' && 'Medication Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' && 'Add a new medication to the pharmacy stock.'}
            {mode === 'edit' && 'Update medication and stock details.'}
            {mode === 'view' && 'Viewing medication stock information.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            if (isViewOnly) return;
            try {
              await onSubmit({
                ...values,
                quantityInStock: Number(values.quantityInStock),
                lowStockThreshold: Number(values.lowStockThreshold),
                category: values.category || undefined,
                manufacturer: values.manufacturer || undefined,
                batchNumber: values.batchNumber || undefined,
                expiryDate: values.expiryDate || undefined,
              });
              onOpenChange(false);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-4">
              {/* Outreach */}
              <div className="space-y-2">
                <Label className={labelClass}>Outreach</Label>
                {!isAdmin ? (
                  <div className={`${fieldClass} flex items-center px-3 text-sm font-medium bg-muted/30`}>
                    {(initialData?.outreach?.name) || activeOutreach?.name || '—'}
                  </div>
                ) : isLoadingOutreaches ? (
                  <div className="h-12 bg-muted animate-pulse rounded-xl" />
                ) : (
                  <Select value={values.outreachId} onValueChange={(v) => setFieldValue('outreachId', v)} disabled={isViewOnly || mode === 'edit'}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select outreach..." />
                    </SelectTrigger>
                    <SelectContent>
                      {outreaches.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <ErrorMessage name="outreachId" component="p" className="text-xs text-destructive font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Medication Name */}
                <div className="space-y-2">
                  <Label htmlFor="medicationName" className={labelClass}>Medication Name</Label>
                  <Field as={Input} id="medicationName" name="medicationName" disabled={isViewOnly} placeholder="e.g. Amoxicillin" className={fieldClass} />
                  <ErrorMessage name="medicationName" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Generic Name */}
                <div className="space-y-2">
                  <Label htmlFor="genericName" className={labelClass}>Generic Name</Label>
                  <Field as={Input} id="genericName" name="genericName" disabled={isViewOnly} placeholder="e.g. Amoxicillin trihydrate" className={fieldClass} />
                  <ErrorMessage name="genericName" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Dosage Form */}
                <div className="space-y-2">
                  <Label className={labelClass}>Dosage Form</Label>
                  <Select value={values.dosageForm} onValueChange={(v) => setFieldValue('dosageForm', v)} disabled={isViewOnly}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select form..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DOSAGE_FORMS.map((f) => (
                        <SelectItem key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="dosageForm" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Strength */}
                <div className="space-y-2">
                  <Label htmlFor="strength" className={labelClass}>Strength</Label>
                  <Field as={Input} id="strength" name="strength" disabled={isViewOnly} placeholder="e.g. 500mg" className={fieldClass} />
                  <ErrorMessage name="strength" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantityInStock" className={labelClass}>Quantity in Stock</Label>
                  <Field as={Input} id="quantityInStock" name="quantityInStock" type="number" min="0" disabled={isViewOnly} className={fieldClass} />
                  <ErrorMessage name="quantityInStock" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Low Stock Threshold */}
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold" className={labelClass}>Low Stock Threshold</Label>
                  <Field as={Input} id="lowStockThreshold" name="lowStockThreshold" type="number" min="0" disabled={isViewOnly} className={fieldClass} />
                  <ErrorMessage name="lowStockThreshold" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Unit of Measure */}
                <div className="space-y-2">
                  <Label className={labelClass}>Unit of Measure</Label>
                  <Select value={values.unitOfMeasure} onValueChange={(v) => setFieldValue('unitOfMeasure', v)} disabled={isViewOnly}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS_OF_MEASURE.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="unitOfMeasure" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className={labelClass}>Expiry Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Field as={Input} id="expiryDate" name="expiryDate" type="date" disabled={isViewOnly} className={fieldClass} />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className={labelClass}>Category <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Select value={values.category || ''} onValueChange={(v) => setFieldValue('category', v)} disabled={isViewOnly}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className={labelClass}>Manufacturer <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Field as={Input} id="manufacturer" name="manufacturer" disabled={isViewOnly} placeholder="e.g. PharmaCorp" className={fieldClass} />
                </div>
              </div>

              {/* Batch Number */}
              <div className="space-y-2">
                <Label htmlFor="batchNumber" className={labelClass}>Batch Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Field as={Input} id="batchNumber" name="batchNumber" disabled={isViewOnly} placeholder="e.g. BATCH-2024-001" className={fieldClass} />
              </div>

              {/* Active toggle (edit only) */}
              {mode === 'edit' && (
                <div className="flex items-center gap-2 pt-1">
                  <Field type="checkbox" id="isActive" name="isActive" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="isActive" className="font-medium cursor-pointer">Active</Label>
                </div>
              )}

              {/* Transaction history (view mode) */}
              {isViewOnly && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm font-semibold text-foreground/80 mb-3">Recent Transactions</p>
                  {isLoadingTransactions ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No transactions recorded yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={TRANSACTION_TYPE_COLORS[t.transactionType] || ''}>
                              {TRANSACTION_TYPE_LABELS[t.transactionType] || t.transactionType}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {t.quantityBefore} → {t.quantityAfter}
                            </span>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{t.performedBy ? `${t.performedBy.firstName} ${t.performedBy.lastName}` : '—'}</p>
                            <p>{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl">
                  {isViewOnly ? 'Close' : 'Cancel'}
                </Button>
                {!isViewOnly && (
                  <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                    {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Medication' : 'Save Changes'}
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
