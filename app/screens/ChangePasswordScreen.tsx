'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { processRequest } from '@/app/source';
import { useAppDispatch } from '@/app/hooks/redux';
import { clearMustChangePassword } from '@/app/store/auth/auth.slice';

const schema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword:     Yup.string().min(8, 'At least 8 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

export default function ChangePasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);
  const [show, setShow] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const toggle = (name: keyof typeof show) => setShow((s) => ({ ...s, [name]: !s[name] }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="text-sm text-muted-foreground text-center">
            Your account requires a password change before you can continue.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Create your password</CardTitle>
            <CardDescription>Choose a strong password of at least 8 characters.</CardDescription>
          </CardHeader>

          <CardContent>
            <Formik
              initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
              validationSchema={schema}
              onSubmit={async ({ currentPassword, newPassword }, { setSubmitting }) => {
                setServerError(null);
                try {
                  await processRequest({
                    method: 'POST',
                    url: 'auth/change-password',
                    data: { currentPassword, newPassword },
                  });
                  dispatch(clearMustChangePassword());
                  router.replace('/dashboard');
                } catch {
                  setServerError('Failed to change password. Please check your current password and try again.');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((name) => (
                    <div key={name} className="space-y-1.5">
                      <Label htmlFor={name}>
                        {{ currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password' }[name]}
                      </Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id={name}
                          name={name}
                          type={show[name] ? 'text' : 'password'}
                          aria-invalid={!!(errors[name] && touched[name])}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => toggle(name)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {show[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <ErrorMessage name={name}>
                        {(msg) => <p className="text-xs text-destructive">{msg}</p>}
                      </ErrorMessage>
                    </div>
                  ))}

                  {serverError && (
                    <p className="text-xs text-destructive text-center">{serverError}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating…' : 'Set password'}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
