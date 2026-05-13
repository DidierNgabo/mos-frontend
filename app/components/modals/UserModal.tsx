import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Plus } from 'lucide-react';
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
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchRoles } from '@/app/store/roles';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  onSubmit: (values: any) => Promise<void>;
}

const schema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  roleIds: Yup.array().of(Yup.string()).min(1, 'At least one role is required'),
  isActive: Yup.boolean(),
});

export function UserModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: UserModalProps) {
  const dispatch = useAppDispatch();
  const { list: roles, isLoadingRoles } = useAppSelector((state) => state.roles);

  useEffect(() => {
    if (open) {
      dispatch(fetchRoles({ limit: 100 }));
      setSelectedRoleToAdd('');
    }
  }, [open, dispatch]);

  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('');
  const isViewOnly = mode === 'view';

  const initialValues = {
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    roleIds: initialData?.roles?.map((r: any) => r.id || r) || [],
    isActive: initialData?.isActive ?? true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Create New User'}
            {mode === 'edit' && 'Edit User'}
            {mode === 'view' && 'User Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' && 'Enter the details of the new user. They will receive an email to set their password.'}
            {mode === 'edit' && 'Update the user details below.'}
            {mode === 'view' && 'Viewing user information.'}
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
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-foreground/80">First Name</Label>
                  <Field
                    as={Input}
                    id="firstName"
                    name="firstName"
                    disabled={isViewOnly}
                    className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                  />
                  <ErrorMessage name="firstName" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-foreground/80">Last Name</Label>
                  <Field
                    as={Input}
                    id="lastName"
                    name="lastName"
                    disabled={isViewOnly}
                    className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                  />
                  <ErrorMessage name="lastName" component="p" className="text-xs text-destructive font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Email Address</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  disabled={isViewOnly || mode === 'edit'} // Usually email is not easily editable, or disable if preferred
                  className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl disabled:opacity-50"
                />
                <ErrorMessage name="email" component="p" className="text-xs text-destructive font-medium" />
              </div>

              <div className="space-y-3">
                {/* Current roles as removable pills */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Roles
                  </Label>
                  {isLoadingRoles ? (
                    <div className="h-8 bg-muted animate-pulse rounded-xl" />
                  ) : values.roleIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No roles assigned.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {values.roleIds.map((id: string) => {
                        const role = roles.find((r) => r.id === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                          >
                            {role?.name ?? id}
                            {!isViewOnly && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFieldValue(
                                    'roleIds',
                                    values.roleIds.filter((r: string) => r !== id),
                                  )
                                }
                                className="ml-0.5 rounded-full hover:bg-primary/20 transition-colors p-0.5"
                                aria-label={`Remove ${role?.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <ErrorMessage name="roleIds" component="p" className="text-xs text-destructive font-medium" />
                </div>

                {/* Add a role — only shows unassigned roles */}
                {!isViewOnly && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Add a Role
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={selectedRoleToAdd}
                        onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                        className="flex-1 h-10 rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        disabled={isLoadingRoles}
                      >
                        <option value="">Select a role…</option>
                        {roles
                          .filter((r) => !values.roleIds.includes(r.id))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!selectedRoleToAdd}
                        onClick={() => {
                          if (selectedRoleToAdd) {
                            setFieldValue('roleIds', [...values.roleIds, selectedRoleToAdd]);
                            setSelectedRoleToAdd('');
                          }
                        }}
                        className="h-10 px-4 rounded-xl"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {(initialData?.station || initialData?.outreaches) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground/80">Station</Label>
                    <p className="h-12 flex items-center px-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                      {initialData?.station?.name || '—'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground/80">Outreaches</Label>
                    <p className="h-12 flex items-center px-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                      {initialData?.outreaches?.length
                        ? initialData.outreaches.map((o: any) => o.name).join(', ')
                        : 'None'}
                    </p>
                  </div>
                </div>
              )}

              {!isViewOnly && (
                <div className="flex items-center gap-2 pt-2">
                  <Field type="checkbox" id="isActive" name="isActive" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="isActive" className="font-medium cursor-pointer">Active User</Label>
                </div>
              )}

              <div className="pt-6 flex gap-3 justify-end">
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
                    {isSubmitting ? 'Saving...' : 'Save User'}
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
