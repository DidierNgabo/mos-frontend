'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { createQueueEntry } from '@/app/store/queue-entries';
import { fetchPatients } from '@/app/store/patients';
import { fetchStations } from '@/app/store/stations';
import { fetchOutreaches } from '@/app/store/outreaches';
import { useDebounce } from '@/app/hooks/useDebounce';
import { toast } from 'sonner';
import { Search, User } from 'lucide-react';

const schema = Yup.object({
  patientId: Yup.string().required('Patient is required'),
  outreachId: Yup.string().required('Please select an outreach'),
  currentStationId: Yup.string().optional(),
  priority: Yup.string().oneOf(['NORMAL', 'URGENT', 'EMERGENCY']).required(),
  chiefComplaint: Yup.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedPatientId?: string;
}

export function QueueEntryModal({ open, onOpenChange, onSuccess, preselectedPatientId }: Props) {
  const dispatch = useAppDispatch();
  const { list: patients } = useAppSelector((s) => s.patients);
  const { list: stations } = useAppSelector((s) => s.stations);
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [patientSearch, setPatientSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(patientSearch, 400);

  useEffect(() => {
    if (open) {
      dispatch(fetchPatients({ limit: 20, search: debouncedSearch || undefined, outreachId: activeOutreachId || undefined }));
      dispatch(fetchStations({ limit: 100, outreachId: activeOutreachId || undefined }));
      if (!activeOutreachId) {
        dispatch(fetchOutreaches({ limit: 100 }));
      }
    }
  }, [open, debouncedSearch, dispatch, activeOutreachId]);

  const selectedPatient = (patientId: string) =>
    patients.find((p) => p.id === patientId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
          <DialogDescription>Select a patient and assign them to a station.</DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            patientId: preselectedPatientId || '',
            outreachId: activeOutreachId || '',
            currentStationId: '',
            priority: 'NORMAL' as 'NORMAL' | 'URGENT' | 'EMERGENCY',
            chiefComplaint: '',
          }}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const payload: Record<string, unknown> = {
                patientId: values.patientId,
                outreachId: values.outreachId,
                priority: values.priority,
              };
              if (values.currentStationId) payload.currentStationId = values.currentStationId;
              if (values.chiefComplaint) payload.chiefComplaint = values.chiefComplaint;
              await dispatch(createQueueEntry(payload)).unwrap();
              toast.success('Patient added to queue');
              resetForm();
              setPatientSearch('');
              setShowResults(false);
              onSuccess();
              onOpenChange(false);
            } catch (err: any) {
              toast.error(err?.message || err || 'Failed to add to queue');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }) => {
            const patient = selectedPatient(values.patientId);
            return (
              <Form className="space-y-4 pt-2">

                {/* Outreach selector — only shown when no active context */}
                {!activeOutreachId && (
                  <div className="space-y-1.5">
                    <Label>Outreach *</Label>
                    <Select value={values.outreachId} onValueChange={(v) => setFieldValue('outreachId', v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select outreach" />
                      </SelectTrigger>
                      <SelectContent>
                        {outreaches.map((o) => (
                          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.outreachId && touched.outreachId && (
                      <p className="text-xs text-destructive">{errors.outreachId}</p>
                    )}
                  </div>
                )}

                {/* Patient search */}
                {!values.patientId ? (
                  <div className="space-y-1.5">
                    <Label>Patient *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or registration number…"
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        className="pl-9 rounded-xl"
                      />
                    </div>
                    {showResults && patients.length > 0 && (
                      <div className="border border-border rounded-xl overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                        {patients.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0 flex items-center gap-3"
                            onClick={() => {
                              setFieldValue('patientId', p.id);
                              setPatientSearch('');
                              setShowResults(false);
                            }}
                          >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {p.firstName?.charAt(0) || 'P'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{p.registrationNumber}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showResults && patientSearch && patients.length === 0 && (
                      <p className="text-sm text-muted-foreground px-1">No patients found.</p>
                    )}
                    {errors.patientId && touched.patientId && (
                      <p className="text-xs text-destructive">{errors.patientId}</p>
                    )}
                  </div>
                ) : (
                  /* Selected patient card */
                  <div className="space-y-1.5">
                    <Label>Patient *</Label>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {patient?.firstName?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{patient?.firstName} {patient?.lastName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{patient?.registrationNumber}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-xs h-7 px-2 text-muted-foreground"
                        onClick={() => setFieldValue('patientId', '')}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Station <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Select value={values.currentStationId} onValueChange={(v) => setFieldValue('currentStationId', v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select station (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Priority *</Label>
                  <div className="flex gap-2">
                    {(['NORMAL', 'URGENT', 'EMERGENCY'] as const).map((p) => {
                      const activeClass = { EMERGENCY: 'bg-red-500/10 border-red-500/40 text-red-600', URGENT: 'bg-amber-500/10 border-amber-500/40 text-amber-600', NORMAL: 'bg-primary/10 border-primary/40 text-primary' }[p];
                      return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFieldValue('priority', p)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors ${
                          values.priority === p ? activeClass : 'border-border text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        {p.charAt(0) + p.slice(1).toLowerCase()}
                      </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Chief Complaint <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Field
                    as="textarea"
                    name="chiefComplaint"
                    placeholder="Why did the patient come today?"
                    className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding…' : 'Add to Queue'}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
