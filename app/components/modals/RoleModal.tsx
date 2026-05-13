'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Role } from '@/app/store/roles/roles.types';

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Role | null;
  onSubmit: (values: any) => Promise<void>;
}

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  isActive: Yup.boolean(),
});

export function RoleModal({ open, onOpenChange, mode, initialData, onSubmit }: RoleModalProps) {
  const isViewOnly = mode === 'view';

  const initialValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {mode === 'create' && 'Create Role'}
            {mode === 'edit' && 'Edit Role'}
            {mode === 'view' && 'Role Details'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' && 'Define a new access role for the system.'}
            {mode === 'edit' && 'Update role details below.'}
            {mode === 'view' && 'Viewing role information.'}
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
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Role Name</Label>
                <Field as={Input} id="name" name="name" disabled={isViewOnly} placeholder="e.g. NURSE" className="h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl" />
                <ErrorMessage name="name" component="p" className="text-xs text-destructive font-medium" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground/80">Description</Label>
                <Field as={Input} id="description" name="description" disabled={isViewOnly} placeholder="Brief description of this role" className="h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl" />
                <ErrorMessage name="description" component="p" className="text-xs text-destructive font-medium" />
              </div>

              {!isViewOnly && (
                <div className="flex items-center gap-2 pt-2">
                  <Field type="checkbox" id="isActive" name="isActive" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="isActive" className="font-medium cursor-pointer">Active Role</Label>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl">
                  {isViewOnly ? 'Close' : 'Cancel'}
                </Button>
                {!isViewOnly && (
                  <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                    {isSubmitting ? 'Saving...' : 'Save Role'}
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
