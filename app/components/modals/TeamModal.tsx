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
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import {
  Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount,
} from '@/app/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchUsers } from '@/app/store/users';
import { fetchTeams } from '@/app/store/teams';
import { Team } from '@/app/store/teams/teams.types';
import { User } from '@/app/store/users/users.types';
import {
  Search, Check, ChevronsUpDown, UsersRound, FileText,
  UserRound, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TEAM_TYPES = ['CLINICAL', 'ALLIED_HEALTH', 'SUPPORTING_STAFF', 'STUDENTS'] as const;

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
];

function avatarColor(u: User): string {
  return AVATAR_COLORS[(u.firstName.charCodeAt(0) + u.lastName.charCodeAt(0)) % AVATAR_COLORS.length];
}

function initials(u: User): string {
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
}

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Team | null;
  outreachId: string;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

const schema = Yup.object({
  name: Yup.string().required('Team name is required'),
  outreachId: Yup.string().required('Outreach is required'),
  type: Yup.string().nullable(),
  parentId: Yup.string().nullable(),
  leaderId: Yup.string().nullable(),
  memberIds: Yup.array().of(Yup.string()),
  isActive: Yup.boolean(),
  description: Yup.string().nullable().max(200),
});

function LeaderCombobox({
  users,
  value,
  onChange,
  disabled,
}: {
  users: User[];
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const selected = users.find((u) => u.id === value);

  return (
    <Popover open={open && !disabled} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full h-11 px-3 flex items-center gap-2 rounded-xl border border-border bg-white/50 dark:bg-black/50 text-sm transition-colors',
            'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
        >
          {selected ? (
            <>
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className={cn('text-white text-xs', avatarColor(selected))}>
                  {initials(selected)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-left font-medium">
                {selected.firstName} {selected.lastName}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onChange(''))}
                className="p-0.5 rounded hover:bg-muted/60 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </>
          ) : (
            <span className="flex-1 text-muted-foreground">Select leader…</span>
          )}
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-border"
        align="start"
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left',
              !value && 'font-medium',
            )}
          >
            <Check className={cn('w-3.5 h-3.5 text-primary shrink-0', value ? 'opacity-0' : 'opacity-100')} />
            <span className="text-muted-foreground">No leader</span>
          </button>
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground text-center">
              {users.length === 0 ? 'No users available.' : 'No results found.'}
            </p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onChange(u.id); setOpen(false); setSearch(''); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left"
              >
                <Check className={cn('w-3.5 h-3.5 text-primary shrink-0', value === u.id ? 'opacity-100' : 'opacity-0')} />
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className={cn('text-white text-xs', avatarColor(u))}>
                    {initials(u)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TeamModal({ open, onOpenChange, mode, initialData, outreachId, onSubmit }: TeamModalProps) {
  const dispatch = useAppDispatch();
  const { list: users } = useAppSelector((s) => s.users);
  const { list: teams } = useAppSelector((s) => s.teams);

  const [memberSearch, setMemberSearch] = useState('');
  const [memberTab, setMemberTab] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers({ limit: 200 }));
      dispatch(fetchTeams({ outreachId, limit: 100 }));
    } else {
      setMemberSearch('');
      setMemberTab('all');
    }
  }, [open, dispatch, outreachId]);

  const isViewOnly = mode === 'view';
  const topLevelTeams = teams.filter((t) => t.parent === null && t.id !== initialData?.id);

  const initialValues = {
    outreachId,
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || '',
    parentId: initialData?.parent?.id || '',
    leaderId: initialData?.leader?.id || '',
    memberIds: initialData?.members?.map((m) => m.id) || [],
    isActive: initialData?.isActive ?? true,
  };

  const titleMap = { create: 'Create Team', edit: 'Edit Team', view: 'Team Details' };
  const subtitleMap = {
    create: 'Add a new team to this outreach.',
    edit: 'Update team details and manage members.',
    view: 'Viewing team information.',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[920px] rounded-3xl p-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <UsersRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">{titleMap[mode]}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-0.5">
                {subtitleMap[mode]}
              </DialogDescription>
            </div>
          </div>
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
                type: values.type || undefined,
                parentId: values.parentId || undefined,
                leaderId: values.leaderId || undefined,
                description: values.description || undefined,
              });
              onOpenChange(false);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            const selectedLeader = users.find((u) => u.id === values.leaderId);

            const filteredBySearch = users.filter((u) => {
              const q = memberSearch.toLowerCase();
              return (
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
              );
            });

            const visibleMembers = memberTab === 'selected'
              ? filteredBySearch.filter((u) => values.memberIds.includes(u.id))
              : filteredBySearch;

            const selectedUsers = users.filter((u) => values.memberIds.includes(u.id));

            const toggleMember = (userId: string) => {
              const next = values.memberIds.includes(userId)
                ? values.memberIds.filter((id) => id !== userId)
                : [...values.memberIds, userId];
              setFieldValue('memberIds', next);
            };

            return (
              <Form className="flex flex-col flex-1 overflow-hidden">
                {/* Body — two columns */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/40">

                    {/* ── Left: Team Information ── */}
                    <div className="p-6 space-y-5">
                      {/* Section title */}
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">Team Information</span>
                      </div>

                      {/* Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Team Name</Label>
                        <Field
                          as={Input}
                          id="name"
                          name="name"
                          disabled={isViewOnly}
                          className="h-11 bg-white/50 dark:bg-black/50 border-border rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground">This is how your team will appear to others.</p>
                        <ErrorMessage name="name" component="p" className="text-xs text-destructive font-medium" />
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-sm font-semibold text-foreground/80">
                          Description <span className="font-normal text-muted-foreground">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <Field
                            as="textarea"
                            id="description"
                            name="description"
                            disabled={isViewOnly}
                            rows={3}
                            maxLength={200}
                            placeholder="Add a short description about this team…"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white/50 dark:bg-black/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 pb-6"
                          />
                          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none">
                            {values.description?.length ?? 0}/200
                          </span>
                        </div>
                      </div>

                      {/* Team Type */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground/80">Team Type</Label>
                        <Select
                          value={values.type}
                          onValueChange={(v) => setFieldValue('type', v === 'none' ? '' : v)}
                          disabled={isViewOnly}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white/50 dark:bg-black/50 border-border">
                            <SelectValue placeholder="Select type (top-level teams only)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {TEAM_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Parent Team */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground/80">Parent Team</Label>
                        <Select
                          value={values.parentId}
                          onValueChange={(v) => setFieldValue('parentId', v === 'none' ? '' : v)}
                          disabled={isViewOnly}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white/50 dark:bg-black/50 border-border">
                            <SelectValue placeholder="Select parent team…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (top-level team)</SelectItem>
                            {topLevelTeams.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Team Leader */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-2">
                          <UserRound className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">Team Leader</span>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-2">
                          Select a team leader who will oversee this team.
                        </p>
                        <LeaderCombobox
                          users={users}
                          value={values.leaderId}
                          onChange={(id) => setFieldValue('leaderId', id)}
                          disabled={isViewOnly}
                        />
                        {selectedLeader && (
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-primary">Leaders can:</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Manage team settings, invite members, and view team reports.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Active status */}
                      {!isViewOnly && (
                        <div className="flex items-center gap-2 pt-1">
                          <Field
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <Label htmlFor="isActive" className="font-medium cursor-pointer text-sm">Active Team</Label>
                        </div>
                      )}
                    </div>

                    {/* ── Right: Team Members ── */}
                    <div className="p-6 flex flex-col gap-4">
                      {/* Section title */}
                      <div>
                        <div className="flex items-center gap-2">
                          <UsersRound className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">Team Members</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Add or remove members from this team.</p>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search members by name or email…"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          disabled={isViewOnly}
                          className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border text-sm"
                        />
                      </div>

                      {/* Tabs */}
                      <div className="flex items-center gap-1 border-b border-border/40">
                        {(['all', 'selected'] as const).map((tab) => {
                          const count = tab === 'all' ? users.length : values.memberIds.length;
                          const label = tab === 'all' ? 'All Members' : 'Selected';
                          return (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setMemberTab(tab)}
                              className={cn(
                                'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                                memberTab === tab
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-muted-foreground hover:text-foreground',
                              )}
                            >
                              {label}{' '}
                              <span className={cn(
                                'inline-flex items-center justify-center text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] ml-1',
                                memberTab === tab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                              )}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* User list */}
                      <div className="flex-1 overflow-y-auto max-h-64 space-y-0.5 -mx-1 px-1">
                        {users.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">Loading users…</p>
                        ) : visibleMembers.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            {memberTab === 'selected' ? 'No members selected yet.' : 'No users match your search.'}
                          </p>
                        ) : (
                          visibleMembers.map((u) => {
                            const checked = values.memberIds.includes(u.id);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                disabled={isViewOnly}
                                onClick={() => toggleMember(u.id)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left',
                                  checked ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/40',
                                  isViewOnly && 'cursor-default',
                                )}
                              >
                                {/* Checkbox */}
                                <div className={cn(
                                  'h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                                  checked ? 'bg-primary border-primary' : 'border-muted-foreground/40',
                                )}>
                                  {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className={cn('text-white text-xs font-semibold', avatarColor(u))}>
                                    {initials(u)}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Name + role */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {u.roles?.[0]?.name ?? '—'}
                                  </p>
                                </div>

                                {/* Email */}
                                <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:block">
                                  {u.email}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Selected summary footer */}
                      {values.memberIds.length > 0 && (
                        <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                          <AvatarGroup>
                            {selectedUsers.slice(0, 3).map((u) => (
                              <Avatar key={u.id} className="h-7 w-7 border-2 border-white dark:border-black">
                                <AvatarFallback className={cn('text-white text-xs', avatarColor(u))}>
                                  {initials(u)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {selectedUsers.length > 3 && (
                              <AvatarGroupCount className="h-7 w-7 text-xs border-2 border-white dark:border-black">
                                +{selectedUsers.length - 3}
                              </AvatarGroupCount>
                            )}
                          </AvatarGroup>
                          <span className="text-sm text-muted-foreground flex-1">
                            {values.memberIds.length} member{values.memberIds.length !== 1 ? 's' : ''} selected
                          </span>
                          {!isViewOnly && (
                            <button
                              type="button"
                              onClick={() => setFieldValue('memberIds', [])}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-3 shrink-0 bg-muted/20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-11 px-6 rounded-xl"
                  >
                    {isViewOnly ? 'Close' : 'Cancel'}
                  </Button>
                  {!isViewOnly && (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {isSubmitting ? 'Saving…' : 'Save Changes'}
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
