import { Suspense } from 'react';
import LoginScreen from '@/app/screens/LoginScreen';

export const metadata = { title: 'Sign In — MOS' };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
