'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, MapPin, ArrowRight, CalendarRange } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { setActiveOutreach, ActiveOutreach } from '@/app/store/outreach-context';

export default function OutreachPickerScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { availableOutreaches, activeOutreachId } = useAppSelector((s) => s.outreachContext);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (activeOutreachId) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, activeOutreachId, router]);

  const handleSelect = (outreach: ActiveOutreach) => {
    dispatch(setActiveOutreach(outreach));
    router.push('/dashboard');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':  return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'PLANNED': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CLOSED':  return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default:        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-8">
      {/* Decorative background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/20 mb-2">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground text-base">
            You are assigned to multiple outreaches. Select one to get started.
          </p>
        </div>

        {/* Outreach cards */}
        {availableOutreaches.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <CalendarRange className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No outreaches assigned. Contact your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableOutreaches.map((outreach) => (
              <button
                key={outreach.id}
                onClick={() => handleSelect(outreach)}
                className="group text-left p-6 rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <CalendarRange className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base leading-tight">{outreach.name}</h3>
                    {outreach.location && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{outreach.location}</span>
                      </div>
                    )}
                    <span className={`inline-flex items-center mt-3 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(outreach.status)}`}>
                      {outreach.status}
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
