'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Stethoscope, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AuthSource } from '@/app/source';

const schema = Yup.object({
  newPassword: Yup.string().min(8, 'At least 8 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

export default function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Invalid reset link</h2>
          <p className="text-muted-foreground text-sm">
            This password reset link is missing or invalid.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-start gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/20 mb-4">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {success ? 'Password updated!' : 'Set new password'}
          </h2>
          <p className="text-base text-muted-foreground">
            {success
              ? 'Your password has been reset successfully.'
              : 'Choose a strong password of at least 8 characters.'}
          </p>
        </div>

        {success ? (
          <div className="p-8 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border shadow-2xl flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password.
            </p>
            <Button
              className="w-full h-12 rounded-xl shadow-lg shadow-primary/25"
              onClick={() => router.push('/login')}
            >
              Sign in
            </Button>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border shadow-2xl">
            <Formik
              initialValues={{ newPassword: '', confirmPassword: '' }}
              validationSchema={schema}
              onSubmit={async ({ newPassword }, { setSubmitting }) => {
                setServerError(null);
                try {
                  await AuthSource.resetPassword(token, newPassword);
                  setSuccess(true);
                } catch (err: unknown) {
                  setServerError(
                    err instanceof Error
                      ? err.message
                      : 'Invalid or expired link. Please request a new one.',
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground/80">
                      New Password
                    </Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="newPassword"
                        name="newPassword"
                        type={showNew ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="h-12 pr-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                        aria-invalid={!!(errors.newPassword && touched.newPassword)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                        tabIndex={-1}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="newPassword">
                      {(msg) => <p className="text-xs text-destructive font-medium">{msg}</p>}
                    </ErrorMessage>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="h-12 pr-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                        aria-invalid={!!(errors.confirmPassword && touched.confirmPassword)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword">
                      {(msg) => <p className="text-xs text-destructive font-medium">{msg}</p>}
                    </ErrorMessage>
                  </div>

                  {serverError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                      {serverError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving…' : 'Set new password'}
                  </Button>
                </Form>
              )}
            </Formik>

            <p className="text-center mt-4 text-sm text-muted-foreground">
              Link expired?{' '}
              <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
                Request a new one
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
