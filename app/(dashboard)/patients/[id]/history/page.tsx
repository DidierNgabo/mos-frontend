import PatientHistoryScreen from '@/app/screens/PatientHistoryScreen';

export const metadata = { title: 'Patient History — MOS' };

export default async function PatientHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientHistoryScreen patientId={id} />;
}
