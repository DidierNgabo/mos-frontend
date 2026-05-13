import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Search } from 'lucide-react';
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
import { fetchUsers } from '@/app/store/users';

interface OutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  onSubmit: (values: any) => Promise<void>;
}

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  location: Yup.string().required('Location is required'),
  date: Yup.date().required('Date is required'),
  status: Yup.string().required('Status is required'),
  memberIds: Yup.array().of(Yup.string()),
});

export function OutreachModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: OutreachModalProps) {
  const dispatch = useAppDispatch();
  const { list: users, isLoadingUsers } = useAppSelector((state) => state.users);

  const [memberSearch, setMemberSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers({ limit: 100 }));
      setMemberSearch('');
      setShowDropdown(false);
    }
  }, [open, dispatch]);

  const isViewOnly = mode === 'view';

  const initialValues = {
    name: initialData?.name || '',
    location: initialData?.location || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    status: initialData?.status || 'PLANNED',
    memberIds: initialData?.members?.map((m: any) => m.id || m) || [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Create New Outreach'}
            {mode === 'edit' && 'Edit Outreach'}
            {mode === 'view' && 'Outreach Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' && 'Enter the details of the new medical outreach.'}
            {mode === 'edit' && 'Update the outreach details below.'}
            {mode === 'view' && 'Viewing outreach information.'}
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
            <Form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Outreach Name</Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  disabled={isViewOnly}
                  placeholder="e.g. Rural Health Camp"
                  className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                />
                <ErrorMessage name="name" component="p" className="text-xs text-destructive font-medium" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold text-foreground/80">Location</Label>
                <Field
                  as={Input}
                  id="location"
                  name="location"
                  disabled={isViewOnly}
                  placeholder="e.g. Village District A"
                  className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                />
                <ErrorMessage name="location" component="p" className="text-xs text-destructive font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-foreground/80">Date</Label>
                  <Field
                    as={Input}
                    id="date"
                    name="date"
                    type="date"
                    disabled={isViewOnly}
                    className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                  />
                  <ErrorMessage name="date" component="p" className="text-xs text-destructive font-medium" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground/80">Status</Label>
                  <Field
                    as="select"
                    id="status"
                    name="status"
                    disabled={isViewOnly}
                    className="flex h-12 w-full rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                  </Field>
                  <ErrorMessage name="status" component="p" className="text-xs text-destructive font-medium" />
                </div>
              </div>

              {/* Members — view: scrollable card list; edit/create: pill + add */}
              {isViewOnly ? (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Members ({initialData?.members?.length ?? 0})
                  </Label>
                  {!initialData?.members?.length ? (
                    <p className="text-sm text-muted-foreground italic">No members assigned.</p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-border/50 divide-y divide-border/30">
                      {initialData.members.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {m.firstName?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Current members as removable pills */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Current Members ({values.memberIds.length})
                    </Label>
                    {isLoadingUsers ? (
                      <div className="h-8 bg-muted animate-pulse rounded-xl" />
                    ) : values.memberIds.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No members assigned.</p>
                    ) : (
                      <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 p-2 rounded-xl border border-border/50">
                        {values.memberIds.map((id: string) => {
                          const u = users.find((usr) => usr.id === id);
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                            >
                              {u ? `${u.firstName} ${u.lastName}` : id}
                              <button
                                type="button"
                                onClick={() =>
                                  setFieldValue(
                                    'memberIds',
                                    values.memberIds.filter((m: string) => m !== id),
                                  )
                                }
                                className="ml-0.5 rounded-full hover:bg-primary/20 transition-colors p-0.5"
                                aria-label="Remove member"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <ErrorMessage name="memberIds" component="p" className="text-xs text-destructive font-medium" />
                  </div>

                  {/* Add a member — searchable combobox */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Add a Member
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by name or email…"
                        value={memberSearch}
                        disabled={isLoadingUsers}
                        onChange={(e) => { setMemberSearch(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                        className="w-full h-10 rounded-xl border border-border bg-white/50 dark:bg-black/50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      />
                      {showDropdown && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-white dark:bg-black shadow-lg">
                          {users
                            .filter((u) => {
                              if (values.memberIds.includes(u.id)) return false;
                              if (!memberSearch) return true;
                              const q = memberSearch.toLowerCase();
                              return (
                                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
                                u.email.toLowerCase().includes(q)
                              );
                            })
                            .map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onMouseDown={() => {
                                  setFieldValue('memberIds', [...values.memberIds, u.id]);
                                  setMemberSearch('');
                                  setShowDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                              >
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                  {u.firstName?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium leading-tight truncate">
                                    {u.firstName} {u.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                </div>
                              </button>
                            ))}
                          {users.filter((u) => {
                            if (values.memberIds.includes(u.id)) return false;
                            if (!memberSearch) return true;
                            const q = memberSearch.toLowerCase();
                            return `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                          }).length === 0 && (
                            <p className="px-3 py-3 text-sm text-muted-foreground text-center">
                              {memberSearch ? 'No users match your search.' : 'All users are already members.'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end">
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
                    {isSubmitting ? 'Saving...' : 'Save Outreach'}
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
