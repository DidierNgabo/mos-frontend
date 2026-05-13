'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { loginUser } from '@/app/store/auth';
import { UsersSource } from '@/app/source';
import {
  setActiveOutreach,
  setAvailableOutreaches,
  ActiveOutreach,
} from '@/app/store/outreach-context';

const schema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoggingInUser, authError } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const idleTimeout = searchParams.get('reason') === 'idle';

  return (
    <div className="min-h-screen flex w-full">
      {/* Decorative Left Side */}
      <div className="hidden lg:flex relative w-1/2 bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-primary-foreground/20 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-20" />
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-secondary blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-accent blur-[100px] mix-blend-screen opacity-30" />

        {/* Content Overlay */}
        <div className="relative z-10 px-12 max-w-lg text-white">
          <div className="mb-8">
            <img
              src="/logo-full-dark.svg"
              alt="Outreach Medical"
              style={{ height: 66, width: 'auto' }}
              className="object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            Streamline your medical outreach.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-light">
            MOS offers a comprehensive, secure, and modern platform to manage
            patients, schedule visits, and handle hospital packages seamlessly.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background px-6 lg:px-16 relative">
        {/* Subtle decorative blob for mobile view */}
        <div className="absolute top-[-10%] right-[-5%] w-72 h-72 rounded-full bg-primary/10 blur-[80px] lg:hidden pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-start gap-2">
            <div className="lg:hidden mb-4">
              <img
                src="/logo-full2.png"
                alt="Outreach Medical"
                style={{ height: 48, width: 'auto' }}
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-base text-muted-foreground">
              Sign in to your account to continue.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border shadow-2xl">
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await dispatch(loginUser(values));
                setSubmitting(false);
                if (!loginUser.fulfilled.match(result)) return;

                // Force password change before anything else
                if (result.payload?.mustChangePassword) {
                  router.push('/change-password');
                  return;
                }

                const user = result.payload?.user;
                const roles: string[] = user?.roles || [];
                const isAdmin =
                  roles.includes('SUPER_ADMIN') ||
                  roles.includes('OUTREACH_ADMIN');

                if (isAdmin) {
                  router.push('/dashboard');
                  return;
                }

                try {
                  const profile = await UsersSource.fetchUserRequest(user.id);
                  const outreaches: ActiveOutreach[] = (
                    profile.outreaches || []
                  ).map((o: Record<string, string>) => ({
                    id: o.id,
                    name: o.name,
                    location: o.location,
                    status: o.status,
                  }));
                  dispatch(setAvailableOutreaches(outreaches));

                  if (outreaches.length === 1) {
                    dispatch(setActiveOutreach(outreaches[0]));
                    router.push('/dashboard');
                  } else if (outreaches.length > 1) {
                    router.push('/select-outreach');
                  } else {
                    router.push('/dashboard');
                  }
                } catch {
                  router.push('/dashboard');
                }
              }}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-foreground/80"
                    >
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
                      {(msg) => (
                        <p className="text-xs text-destructive font-medium">
                          {msg}
                        </p>
                      )}
                    </ErrorMessage>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-foreground/80"
                      >
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-12 pr-12 bg-white/50 dark:bg-black/50 border-border focus-visible:ring-primary/50 transition-all rounded-xl"
                        aria-invalid={!!(errors.password && touched.password)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                        tabIndex={-1}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password">
                      {(msg) => (
                        <p className="text-xs text-destructive font-medium">
                          {msg}
                        </p>
                      )}
                    </ErrorMessage>
                  </div>

                  {idleTimeout && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-medium text-center">
                      You were signed out after 30 minutes of inactivity.
                    </div>
                  )}

                  {authError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                      {authError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    disabled={isLoggingInUser}
                  >
                    {isLoggingInUser ? 'Signing in…' : 'Sign in'}
                  </Button>
                </Form>
              )}
            </Formik>
          </div>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Contact your administrator if you don&apos;t have an account.
          </p>
        </div>
      </div>
    </div>
  );
}
