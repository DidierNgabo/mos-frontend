'use client';

import { useAppSelector } from '@/app/hooks/redux';
import TeamsScreen from '@/app/screens/TeamsScreen';

export default function TeamsPage() {
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Teams
        </h2>
        <p className="text-muted-foreground mt-1">
          View your team leaders, members, and assigned service stations.
        </p>
      </div>

      {activeOutreachId ? (
        <TeamsScreen outreachId={activeOutreachId} />
      ) : (
        <div className="flex items-center justify-center h-40 rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 text-muted-foreground">
          Select an outreach from the top bar to view its teams.
        </div>
      )}
    </div>
  );
}
