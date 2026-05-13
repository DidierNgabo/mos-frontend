'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Stethoscope, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AuthSource } from '@/app/source';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const [submitted, setSubmitted] = useState(false);

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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Forgot password?</h2>
          <p className="text-base text-muted-foreground">
            {submitted
              ? "If that email is registered, you'll receive a reset link shortly."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border shadow-2xl flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <MailCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              A password reset link has been sent. The link expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="text-sm font-semibold text-primary hover:underline mt-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border shadow-2xl">
            <Formik
              initialValues={{ email: '' }}
              validationSchema={schema}
              onSubmit={async ({ email }, { setSubmitting }) => {
                try {
                  await AuthSource.forgotPassword(email);
                } catch {
                  // Always show success to not reveal whether email exists
                }
                setSubmitting(false);
                setSubmitted(true);
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">
                      Email Address
                    </Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                      aria-invalid={!!(errors.email && touched.email)}
                    />
                    <ErrorMessage name="email">
                      {(msg) => <p className="text-xs text-destructive font-medium">{msg}</p>}
                    </ErrorMessage>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending…' : 'Send reset link'}
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        )}

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
