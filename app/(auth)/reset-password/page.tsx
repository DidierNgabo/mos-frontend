import { Suspense } from 'react';
import ResetPasswordScreen from '@/app/screens/ResetPasswordScreen';

export const metadata = { title: 'Reset Password — MOS' };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
