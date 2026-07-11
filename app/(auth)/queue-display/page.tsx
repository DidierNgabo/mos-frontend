import { Suspense } from 'react';
import QueueDisplayScreen from '@/app/screens/QueueDisplayScreen';

export const metadata = { title: 'Service Queue — Live Display' };

export default function QueueDisplayPage() {
  return (
    <Suspense>
      <QueueDisplayScreen />
    </Suspense>
  );
}
