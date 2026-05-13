'use client';

import { useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchOutreaches } from '@/app/store/outreaches';
import { Station } from '@/app/store/stations/stations.types';

const STATION_TYPES = ['CLINICAL', 'LAB', 'PHARMACY', 'SCREENING', 'RADIOLOGY'] as const;

interface StationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Station | null;
  onSubmit: (values: any) => Promise<void>;
}

const schema = Yup.object({
  outreachId: Yup.string().required('Outreach is required'),
  name: Yup.string().required('Station name is required'),
  type: Yup.string().oneOf(STATION_TYPES as unknown as string[]).required('Type is required'),
  isActive: Yup.boolean(),
});

export function StationModal({ open, onOpenChange, mode, initialData, onSubmit }: StationModalProps) {
  const dispatch = useAppDispatch();
  const { list: outreaches, isLoadingOutreaches } = useAppSelector((s) => s.outreaches);

  useEffect(() => {
    if (open) dispatch(fetchOutreaches({ limit: 100 }));
  }, [open, dispatch]);

  const isViewOnly = mode === 'view';

  const initialValues = {
    outreachId: initialData?.outreach?.id || '',
    name: initialData?.name || '',
    type: initialData?.type || '',
    isActive: initialData?.isActive ?? true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Create Station'}
            {mode === 'edit' && 'Edit Station'}
            {mode === 'view' && 'Station Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' && 'Add a new station to an outreach.'}
            {mode === 'edit' && 'Update station details below.'}
            {mode === 'view' && 'Viewing station information.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            if (isViewOnly) return;
            try {
              await onSubmit(values);
              onOpenChange(false);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground/80">Outreach</Label>
                {isLoadingOutreaches ? (
                  <div className="h-12 bg-muted animate-pulse rounded-xl" />
                ) : (
                  <Select value={values.outreachId} onValueChange={(v) => setFieldValue('outreachId', v)} disabled={isViewOnly || mode === 'edit'}>
                    <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-black/50 border-border">
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

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Station Name</Label>
                <Field as={Input} id="name" name="name" disabled={isViewOnly} className="h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl" />
                <ErrorMessage name="name" component="p" className="text-xs text-destructive font-medium" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground/80">Station Type</Label>
                <Select value={values.type} onValueChange={(v) => setFieldValue('type', v)} disabled={isViewOnly}>
                  <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-black/50 border-border">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorMessage name="type" component="p" className="text-xs text-destructive font-medium" />
              </div>

              {!isViewOnly && (
                <div className="flex items-center gap-2 pt-2">
                  <Field type="checkbox" id="isActive" name="isActive" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="isActive" className="font-medium cursor-pointer">Active Station</Label>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl">
                  {isViewOnly ? 'Close' : 'Cancel'}
                </Button>
                {!isViewOnly && (
                  <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                    {isSubmitting ? 'Saving...' : 'Save Station'}
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
