'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Footprints,
  ShieldAlert,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { createEvangelismRecord } from '@/app/store/evangelism-records';
import { fetchOutreaches } from '@/app/store/outreaches';
import { fetchPatients } from '@/app/store/patients';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAbility } from '@/app/hooks/useAbility';
import {
  PreFormGuidance,
  PostFormGuidance,
} from '@/app/components/evangelism/EvangelismGuidance';
import {
  EvangelismRecordFormFields,
  buildEvangelismRecordPayload,
  evangelismRecordSchema,
  getEvangelismRecordInitialValues,
} from '@/app/components/evangelism/EvangelismRecordFormFields';
import { toast } from 'sonner';

export default function NewEvangelismRecordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ability = useAbility();
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { list: patients, isLoadingPatients } = useAppSelector((s) => s.patients);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [activeTab, setActiveTab] = useState('guidance');

  useEffect(() => {
    dispatch(fetchOutreaches({ limit: 100 }));
    dispatch(fetchPatients({ limit: 200 }));
  }, [dispatch]);

  if (!ability.can('create', 'EvangelismRecord')) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="text-sm text-foreground/90">
                You don&apos;t have permission to create evangelism records.
              </p>
              <Button variant="outline" onClick={() => router.push('/evangelism')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Evangelism
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="mb-2 -ml-2 text-muted-foreground"
          onClick={() => router.push('/evangelism')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Evangelism
        </Button>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Andika Igikorwa cyo Kubwiriza
        </h2>
        <p className="text-muted-foreground mt-1">
          Soma amabwiriza, uganire n&apos;umuntu, hanyuma wuzuze ifishi hakurikijwe ibyo
          mwaganiriyeho.
        </p>
      </div>

      <Formik
        initialValues={getEvangelismRecordInitialValues(null, activeOutreachId)}
        validationSchema={evangelismRecordSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            await dispatch(
              createEvangelismRecord(buildEvangelismRecordPayload(values)),
            ).unwrap();
            toast.success('Evangelism record saved successfully');
            resetForm();
            setActiveTab('closing');
          } catch (err: any) {
            toast.error(err || 'Failed to save evangelism record');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting, resetForm }) => (
          <Form>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="guidance">
                  <BookOpen className="w-4 h-4" /> Amabwiriza
                </TabsTrigger>
                <TabsTrigger value="form">
                  <ClipboardList className="w-4 h-4" /> Ifishi
                </TabsTrigger>
                <TabsTrigger value="closing">
                  <Footprints className="w-4 h-4" /> Gusoza
                </TabsTrigger>
              </TabsList>

              {/* ── Tab 1: Pre-form guidance ──────────────── */}
              <TabsContent value="guidance" className="mt-6 space-y-6">
                <PreFormGuidance />
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab('form')} className="rounded-xl">
                    Komeza ku Ifishi
                  </Button>
                </div>
              </TabsContent>

              {/* ── Tab 2: The form ────────────────────────── */}
              <TabsContent value="form" className="mt-6">
                <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm p-6">
                  <EvangelismRecordFormFields
                    values={values}
                    setFieldValue={setFieldValue}
                    isViewOnly={false}
                    isEditing={false}
                    outreaches={outreaches}
                    patients={patients}
                    isLoadingPatients={isLoadingPatients}
                  />

                  <div className="pt-4 flex gap-3 justify-end border-t border-border/50 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/evangelism')}
                      className="h-12 px-6 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    >
                      {isSubmitting ? 'Saving...' : 'Bika Iyi Nyandiko'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── Tab 3: Post-form guidance ─────────────── */}
              <TabsContent value="closing" className="mt-6 space-y-6">
                <PostFormGuidance />
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      resetForm();
                      setActiveTab('form');
                    }}
                  >
                    Andika Undi Muntu
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl"
                    onClick={() => router.push('/evangelism')}
                  >
                    Subira ku Rutonde
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Form>
        )}
      </Formik>
    </div>
  );
}
