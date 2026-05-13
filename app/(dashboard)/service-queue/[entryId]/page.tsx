import PatientChartScreen from '@/app/screens/PatientChartScreen';

export const metadata = { title: 'Patient Chart — MOS' };

export default async function PatientChartPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  return <PatientChartScreen entryId={entryId} />;
}
