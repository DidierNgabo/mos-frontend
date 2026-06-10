/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
} from 'rwanda-locations';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { DateOfBirthPicker } from '@/app/components/ui/date-of-birth-picker';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchOutreaches } from '@/app/store/outreaches';
import { Patient } from '@/app/store/patients/patients.types';

const ADMIN_ROLES = ['SUPER_ADMIN', 'OUTREACH_ADMIN'];

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Patient | null;
  onSubmit: (values: any) => Promise<void>;
}

// Updated schema: Sector and Cell are now required to ensure the cascade to Village works properly
const schema = Yup.object({
  outreachId: Yup.string().required('Outreach is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .test('not-future', 'Date of birth cannot be in the future', (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
  gender: Yup.string().oneOf(['MALE', 'FEMALE']).required('Gender is required'),
  province: Yup.string().required('Province is required'),
  district: Yup.string().required('District is required'),
  sector: Yup.string().required('Sector is required'),
  cell: Yup.string().required('Cell is required'),
  village: Yup.string().required('Village is required'),
  phoneNumber: Yup.string()
    .nullable()
    .test('valid-phone', 'Enter a valid phone number', (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length <= 3 || digits.length >= 10;
    }),
  nationalId: Yup.string()
    .nullable()
    .test('nid-16-digits', 'National ID must be exactly 16 digits', (value) => {
      if (!value) return true;
      return /^\d{16}$/.test(value);
    }),
});

const INPUT_CLS = 'h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl';
const SELECT_CLS =
  'h-12 rounded-xl bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50';

export function PatientModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: PatientModalProps) {
  const dispatch = useAppDispatch();
  const { list: outreaches, isLoadingOutreaches } = useAppSelector(
    (s) => s.outreaches,
  );
  const user = useAppSelector((s) => s.auth.user);
  const activeOutreach = useAppSelector(
    (s) => s.outreachContext.activeOutreach,
  );

  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r)) ?? false;

  // Track which button triggered the submit to optimize fast registrations
  const submitActionRef = useRef<'save' | 'save-and-add'>('save');

  const isViewOnly = mode === 'view';

  useEffect(() => {
    if (!open) return;
    if (isAdmin) dispatch(fetchOutreaches({ limit: 100 }));
  }, [open, isAdmin, dispatch]);

  const initialValues = {
    outreachId:
      initialData?.outreach?.id ||
      (!isAdmin && activeOutreach ? activeOutreach.id : ''),
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth
      ? initialData.dateOfBirth.slice(0, 10)
      : '',
    gender: initialData?.gender || '',
    province: initialData?.province || '',
    district: initialData?.district || '',
    sector: initialData?.sector || '',
    cell: initialData?.cell || '',
    village: initialData?.village || '',
    phoneNumber: initialData?.phoneNumber || '',
    nationalId: initialData?.nationalId || '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Register New Patient'}
            {mode === 'edit' && 'Edit Patient'}
            {mode === 'view' && 'Patient Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' &&
              'Fill in the patient registration details below.'}
            {mode === 'edit' && 'Update the patient record.'}
            {mode === 'view' && 'Viewing patient information.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            if (isViewOnly) return;
            try {
              const digits = (values.phoneNumber || '').replace(/\D/g, '');
              await onSubmit({
                ...values,
                phoneNumber: digits.length > 3 ? values.phoneNumber : undefined,
                nationalId: values.nationalId || undefined,
              });

              // Fast-entry UX: Retain location/outreach data if adding another
              if (submitActionRef.current === 'save-and-add') {
                resetForm({
                  values: {
                    ...initialValues, // Resets personal fields (names, dob, id)
                    outreachId: values.outreachId,
                    province: values.province,
                    district: values.district,
                    sector: values.sector,
                    cell: values.cell,
                    village: values.village,
                  },
                });
                // Focus top input to start typing immediately
                document.getElementById('firstName')?.focus();
              } else {
                onOpenChange(false);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            // Retrieve cascading location arrays based on current form values
            const availableProvinces = getProvinces() || [];
            // console.log('*****Available Provinces:', availableProvinces);
            console.log(getProvinces());
            console.log('**** IN Kigali', getDistricts('City Of Kigali'));
            const availableDistricts = values.province
              ? getDistricts(values.province.toLowerCase()) || []
              : [];
            // console.log('*****Available Districts:', availableDistricts);
            // console.log(
            //   '*****Districts',
            //   getDistricts(values.province.toLowerCase()),
            // );
            const availableSectors =
              values.province && values.district
                ? getSectors(
                    values.province.toLowerCase(),
                    values.district.toLowerCase(),
                  ) || []
                : [];
            const availableCells =
              values.province && values.district && values.sector
                ? getCells(
                    values.province.toLowerCase(),
                    values.district.toLowerCase(),
                    values.sector.toLowerCase(),
                  ) || []
                : [];
            const availableVillages =
              values.province && values.district && values.sector && values.cell
                ? getVillages(
                    values.province.toLowerCase(),
                    values.district.toLowerCase(),
                    values.sector.toLowerCase(),
                    values.cell.toLowerCase(),
                  ) || []
                : [];

            return (
              <Form className="space-y-4">
                {/* ── Outreach ─────────────────────────────── */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/80">
                    Outreach
                  </Label>
                  {!isAdmin ? (
                    <div
                      className={`${SELECT_CLS} flex items-center px-3 bg-muted/40 text-foreground/70 cursor-default`}
                    >
                      {activeOutreach?.name ?? 'No active outreach'}
                    </div>
                  ) : isLoadingOutreaches ? (
                    <div className="h-12 bg-muted animate-pulse rounded-xl" />
                  ) : (
                    <Select
                      value={values.outreachId}
                      onValueChange={(v) => setFieldValue('outreachId', v)}
                      disabled={isViewOnly || mode === 'edit'}
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
                  )}
                  <ErrorMessage
                    name="outreachId"
                    component="p"
                    className="text-xs text-destructive font-medium"
                  />
                </div>

                {/* ── Name ─────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-semibold text-foreground/80"
                    >
                      First Name
                    </Label>
                    <Field
                      as={Input}
                      id="firstName"
                      name="firstName"
                      disabled={isViewOnly}
                      className={INPUT_CLS}
                    />
                    <ErrorMessage
                      name="firstName"
                      component="p"
                      className="text-xs text-destructive font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-semibold text-foreground/80"
                    >
                      Last Name
                    </Label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      disabled={isViewOnly}
                      className={INPUT_CLS}
                    />
                    <ErrorMessage
                      name="lastName"
                      component="p"
                      className="text-xs text-destructive font-medium"
                    />
                  </div>
                </div>

                {/* ── Date of Birth + Gender ────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="dateOfBirth"
                      className="text-sm font-semibold text-foreground/80"
                    >
                      Date of Birth
                    </Label>
                    <DateOfBirthPicker
                      value={values.dateOfBirth ?? ''}
                      onChange={(v) => setFieldValue('dateOfBirth', v)}
                      disabled={isViewOnly}
                    />
                    <ErrorMessage
                      name="dateOfBirth"
                      component="p"
                      className="text-xs text-destructive font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground/80">
                      Gender
                    </Label>
                    <Select
                      value={values.gender}
                      onValueChange={(v) => setFieldValue('gender', v)}
                      disabled={isViewOnly}
                    >
                      <SelectTrigger className={SELECT_CLS}>
                        <SelectValue placeholder="Select gender..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="gender"
                      component="p"
                      className="text-xs text-destructive font-medium"
                    />
                  </div>
                </div>

                {/* ── Location (Cascading Dropdowns) ───────── */}
                <div className="pt-1 bg-muted/20 p-4 rounded-xl border border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                    Location Hierarchy
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {/* PROVINCE */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground/80">
                        Province
                      </Label>
                      <Select
                        value={values.province}
                        onValueChange={(v) => {
                          setFieldValue('province', v);
                          setFieldValue('district', '');
                          setFieldValue('sector', '');
                          setFieldValue('cell', '');
                          setFieldValue('village', '');
                        }}
                        disabled={isViewOnly}
                      >
                        <SelectTrigger className={SELECT_CLS}>
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProvinces.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="province"
                        component="p"
                        className="text-xs text-destructive font-medium"
                      />
                    </div>

                    {/* DISTRICT */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground/80">
                        District
                      </Label>
                      <Select
                        value={values.district}
                        onValueChange={(v) => {
                          setFieldValue('district', v);
                          setFieldValue('sector', '');
                          setFieldValue('cell', '');
                          setFieldValue('village', '');
                        }}
                        disabled={isViewOnly || !values.province}
                      >
                        <SelectTrigger className={SELECT_CLS}>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="district"
                        component="p"
                        className="text-xs text-destructive font-medium"
                      />
                    </div>

                    {/* SECTOR */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground/80">
                        Sector
                      </Label>
                      <Select
                        value={values.sector}
                        onValueChange={(v) => {
                          setFieldValue('sector', v);
                          setFieldValue('cell', '');
                          setFieldValue('village', '');
                        }}
                        disabled={isViewOnly || !values.district}
                      >
                        <SelectTrigger className={SELECT_CLS}>
                          <SelectValue placeholder="Select Sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSectors.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="sector"
                        component="p"
                        className="text-xs text-destructive font-medium"
                      />
                    </div>

                    {/* CELL */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground/80">
                        Cell
                      </Label>
                      <Select
                        value={values.cell}
                        onValueChange={(v) => {
                          setFieldValue('cell', v);
                          setFieldValue('village', '');
                        }}
                        disabled={isViewOnly || !values.sector}
                      >
                        <SelectTrigger className={SELECT_CLS}>
                          <SelectValue placeholder="Select Cell" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCells.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="cell"
                        component="p"
                        className="text-xs text-destructive font-medium"
                      />
                    </div>
                  </div>

                  {/* VILLAGE */}
                  <div className="space-y-1.5 mt-4">
                    <Label className="text-sm font-semibold text-foreground/80">
                      Village
                    </Label>
                    <Select
                      value={values.village}
                      onValueChange={(v) => setFieldValue('village', v)}
                      disabled={isViewOnly || !values.cell}
                    >
                      <SelectTrigger className={SELECT_CLS}>
                        <SelectValue placeholder="Select Village" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVillages.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="village"
                      component="p"
                      className="text-xs text-destructive font-medium"
                    />
                  </div>
                </div>

                {/* ── Phone Number ──────────────────────────── */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/80">
                    Phone Number{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <div className="flex h-12 rounded-xl border border-border bg-white/50 dark:bg-black/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
                    <PhoneInput
                      defaultCountry="rw"
                      value={values.phoneNumber || ''}
                      onChange={(phone) => setFieldValue('phoneNumber', phone)}
                      disabled={isViewOnly}
                      inputStyle={{
                        height: '100%',
                        width: '100%',
                        fontSize: '14px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        paddingLeft: '8px',
                        color: 'inherit',
                      }}
                      countrySelectorStyleProps={{
                        buttonStyle: {
                          height: '100%',
                          border: 'none',
                          borderRight: '1px solid hsl(var(--border))',
                          backgroundColor: 'transparent',
                          paddingLeft: '10px',
                          paddingRight: '6px',
                        },
                      }}
                      style={{ width: '100%', display: 'flex' }}
                    />
                  </div>
                  <ErrorMessage
                    name="phoneNumber"
                    component="p"
                    className="text-xs text-destructive font-medium"
                  />
                </div>

                {/* ── National ID ───────────────────────────── */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="nationalId"
                    className="text-sm font-semibold text-foreground/80"
                  >
                    National ID{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional — 16 digits)
                    </span>
                  </Label>
                  <Field name="nationalId">
                    {({ field, form }: any) => (
                      <Input
                        {...field}
                        id="nationalId"
                        inputMode="numeric"
                        maxLength={16}
                        disabled={isViewOnly}
                        placeholder="1234567890123456"
                        className="h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl font-mono tracking-widest"
                        onChange={(e) => {
                          const digitsOnly = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 16);
                          form.setFieldValue('nationalId', digitsOnly);
                        }}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="nationalId"
                    component="p"
                    className="text-xs text-destructive font-medium"
                  />
                </div>

                {/* ── Actions ───────────────────────────────── */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-12 px-6 rounded-xl order-3 sm:order-1"
                  >
                    {isViewOnly ? 'Close' : 'Cancel'}
                  </Button>

                  {!isViewOnly && mode === 'create' && (
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isSubmitting}
                      onClick={() => {
                        submitActionRef.current = 'save-and-add';
                      }}
                      className="h-12 px-6 rounded-xl order-2"
                    >
                      Save & Add Another
                    </Button>
                  )}

                  {!isViewOnly && (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={() => {
                        submitActionRef.current = 'save';
                      }}
                      className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all order-1 sm:order-3"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Patient'}
                    </Button>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
