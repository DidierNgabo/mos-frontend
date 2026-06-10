'use client';

import * as Yup from 'yup';
import { Field, ErrorMessage } from 'formik';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Outreach } from '@/app/store/outreaches/outreaches.types';
import { Patient } from '@/app/store/patients/patients.types';
import { EvangelismRecord } from '@/app/store/evangelism-records/evangelism-records.types';

export const evangelismRecordSchema = Yup.object({
  outreachId: Yup.string().required('Outreach is required'),
  patientId: Yup.string().optional(),
  name: Yup.string().required('Name is required'),
  healingRequest: Yup.string().optional(),
  sinsToConfess: Yup.string().optional(),
  isSaved: Yup.boolean(),
  acceptedJesus: Yup.boolean(),
  continueTheJourney: Yup.boolean(),
  followUp: Yup.boolean(),
  notSure: Yup.boolean(),
  declined: Yup.boolean(),
  prayerRequest: Yup.string().optional(),
});

export interface EvangelismRecordFormValues {
  outreachId: string;
  patientId: string;
  name: string;
  healingRequest: string;
  sinsToConfess: string;
  isSaved: boolean;
  acceptedJesus: boolean;
  continueTheJourney: boolean;
  followUp: boolean;
  notSure: boolean;
  declined: boolean;
  prayerRequest: string;
}

export function getEvangelismRecordInitialValues(
  initialData?: EvangelismRecord | null,
  activeOutreachId?: string | null,
): EvangelismRecordFormValues {
  return {
    outreachId: initialData?.outreach?.id || activeOutreachId || '',
    patientId: initialData?.patient?.id || '',
    name: initialData?.name || '',
    healingRequest: initialData?.healingRequest || '',
    sinsToConfess: initialData?.sinsToConfess || '',
    isSaved: initialData?.isSaved ?? false,
    acceptedJesus: initialData?.acceptedJesus ?? false,
    continueTheJourney: initialData?.continueTheJourney ?? false,
    followUp: initialData?.followUp ?? false,
    notSure: initialData?.notSure ?? false,
    declined: initialData?.declined ?? false,
    prayerRequest: initialData?.prayerRequest || '',
  };
}

export const SELECT_CLS =
  'h-12 rounded-xl bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50';

export const sectionLabel = (text: string) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3 mt-5">
    {text}
  </p>
);

interface EvangelismRecordFormFieldsProps {
  values: EvangelismRecordFormValues;
  setFieldValue: (field: string, value: unknown) => void;
  isViewOnly: boolean;
  isEditing: boolean;
  outreaches: Outreach[];
  patients: Patient[];
  isLoadingPatients: boolean;
}

export function EvangelismRecordFormFields({
  values,
  setFieldValue,
  isViewOnly,
  isEditing,
  outreaches,
  patients,
  isLoadingPatients,
}: EvangelismRecordFormFieldsProps) {
  return (
    <>
      {/* ── Outreach & Person ───────────────────── */}
      {sectionLabel('Outreach & Person')}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground/80">Outreach</Label>
          <Select
            value={values.outreachId}
            onValueChange={(v) => setFieldValue('outreachId', v)}
            disabled={isViewOnly || isEditing}
          >
            <SelectTrigger className={SELECT_CLS}>
              <SelectValue placeholder="Select outreach..." />
            </SelectTrigger>
            <SelectContent>
              {outreaches.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage name="outreachId" component="p" className="text-xs text-destructive font-medium" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground/80">
            Link to Existing Patient <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          {isLoadingPatients ? (
            <div className="h-12 bg-muted animate-pulse rounded-xl" />
          ) : (
            <Select
              value={values.patientId || 'none'}
              onValueChange={(v) => {
                if (v === 'none') {
                  setFieldValue('patientId', '');
                  return;
                }
                setFieldValue('patientId', v);
                const patient = patients.find((p) => p.id === v);
                if (patient) {
                  setFieldValue('name', `${patient.firstName} ${patient.lastName}`);
                }
              }}
              disabled={isViewOnly || isEditing}
            >
              <SelectTrigger className={SELECT_CLS}>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.registrationNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mt-4">
        <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">
          Name of Person Evangelized
        </Label>
        <Field as={Input} id="name" name="name" disabled={isViewOnly} className="h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl" />
        <ErrorMessage name="name" component="p" className="text-xs text-destructive font-medium" />
      </div>

      {/* ── III. Ibibazo ────────────────────────── */}
      {sectionLabel("III. Ibibazo")}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground/80">
            III.A — Ibibazo by&apos;ubuzima
          </Label>
          <p className="text-xs text-muted-foreground">
            Ese hari ibintu cyangwa indwara wifuza ko Yesu yagukiza? Nibihe?
          </p>
          <Textarea
            name="healingRequest"
            value={values.healingRequest}
            onChange={(e) => setFieldValue('healingRequest', e.target.value)}
            disabled={isViewOnly}
            rows={2}
            className="bg-white/50 dark:bg-black/50 border-border rounded-xl resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground/80">
            III.B — Ibyaha wifuza gusengerwa
          </Label>
          <p className="text-xs text-muted-foreground">
            Ese hari ibyaha wumva Yesu yakubabarira? Nibihe?
          </p>
          <Textarea
            name="sinsToConfess"
            value={values.sinsToConfess}
            onChange={(e) => setFieldValue('sinsToConfess', e.target.value)}
            disabled={isViewOnly}
            rows={2}
            className="bg-white/50 dark:bg-black/50 border-border rounded-xl resize-none"
          />
        </div>
      </div>

      {/* ── IV. Gufata Icyemezo ──────────────────── */}
      {sectionLabel('IV. Gufata Icyemezo')}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="isSaved" className="text-sm font-medium">
              a) Narakijijwe
            </Label>
            <p className="text-xs text-muted-foreground">
              (niba ari yego musabire imbaraga zo gukomera muri Kristo Yesu, niba ari oya komeza)
            </p>
          </div>
          <Switch
            id="isSaved"
            checked={values.isSaved}
            onCheckedChange={(v) => setFieldValue('isSaved', v)}
            disabled={isViewOnly}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="acceptedJesus" className="text-sm font-medium">
            b) Nemeye kwakira Yesu nk&apos;Umwami n&apos;Umukiza w&apos;ubuzima n&apos;ubugingo bwanjye
          </Label>
          <Switch
            id="acceptedJesus"
            checked={values.acceptedJesus}
            onCheckedChange={(v) => setFieldValue('acceptedJesus', v)}
            disabled={isViewOnly}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="continueTheJourney" className="text-sm font-medium">
            c) Ndifuza gukomeza kwiga Ijambo ry&apos;Imana no gusengerwa by&apos;umwihariko
          </Label>
          <Switch
            id="continueTheJourney"
            checked={values.continueTheJourney}
            onCheckedChange={(v) => setFieldValue('continueTheJourney', v)}
            disabled={isViewOnly}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="followUp" className="text-sm font-medium">
            d) Nifuza ko bankurikira (Follow-up)
          </Label>
          <Switch
            id="followUp"
            checked={values.followUp}
            onCheckedChange={(v) => setFieldValue('followUp', v)}
            disabled={isViewOnly}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="notSure" className="text-sm font-medium">
            e) Ndifashe
          </Label>
          <Switch
            id="notSure"
            checked={values.notSure}
            onCheckedChange={(v) => setFieldValue('notSure', v)}
            disabled={isViewOnly}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="declined" className="text-sm font-medium">
            f) Ntabyo nshaka
          </Label>
          <Switch
            id="declined"
            checked={values.declined}
            onCheckedChange={(v) => setFieldValue('declined', v)}
            disabled={isViewOnly}
          />
        </div>
      </div>

      {/* ── V. Isengesho ─────────────────────────── */}
      {sectionLabel('V. Isengesho (Prayer Request)')}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Ese haba hari ibindi bintu bikugoye tutavuze wifuza ko twafatanya kubisengera?
        </p>
        <Textarea
          name="prayerRequest"
          value={values.prayerRequest}
          onChange={(e) => setFieldValue('prayerRequest', e.target.value)}
          disabled={isViewOnly}
          rows={3}
          className="bg-white/50 dark:bg-black/50 border-border rounded-xl resize-none"
        />
      </div>
    </>
  );
}

export function buildEvangelismRecordPayload(values: EvangelismRecordFormValues) {
  return {
    outreachId: values.outreachId,
    patientId: values.patientId || undefined,
    name: values.name,
    healingRequest: values.healingRequest || undefined,
    sinsToConfess: values.sinsToConfess || undefined,
    isSaved: values.isSaved,
    acceptedJesus: values.acceptedJesus,
    continueTheJourney: values.continueTheJourney,
    followUp: values.followUp,
    notSure: values.notSure,
    declined: values.declined,
    prayerRequest: values.prayerRequest || undefined,
  };
}
