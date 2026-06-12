'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Brain, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { useDebounce } from '@/app/hooks/useDebounce';
import { fetchOutreaches } from '@/app/store/outreaches';
import { PHQ9ScreeningsSource } from '@/app/source';
import { MentalHealthSession } from '@/app/store/phq9-screenings/phq9-screenings.types';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

const PAGE_SIZE = 10;

const severityStyles: Record<string, string> = {
  NONE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  MINIMAL: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  MILD: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  MODERATE: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  MOD_SEVERE: 'border-orange-500/30 bg-orange-500/10 text-orange-700',
  SEVERE: 'border-red-500/30 bg-red-500/10 text-red-700',
  EXTREME: 'border-red-700/30 bg-red-700/10 text-red-800',
};

function readable(value: string | null | undefined) {
  if (!value) return 'Not recorded';
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge className={severityStyles[severity] ?? ''}>
      {readable(severity)}
    </Badge>
  );
}

function Score({
  label,
  score,
  severity,
}: {
  label: string;
  score?: number;
  severity?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {score === undefined || !severity ? (
        <p className="mt-2 text-sm text-muted-foreground">Not applicable</p>
      ) : (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xl font-bold">{score}</span>
          <SeverityBadge severity={severity} />
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function SessionDetails({
  session,
  open,
  onOpenChange,
}: {
  session: MentalHealthSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!session) return null;

  const notes = [
    ['PHQ-9', session.phq9.notes],
    ['GAD-7', session.gad7?.notes],
    ['PCL-5', session.pcl5?.notes],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none overflow-y-auto rounded-2xl p-4 sm:max-h-[90vh] sm:max-w-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle>Mental Health Screening Details</DialogTitle>
          <DialogDescription>
            {session.patient.firstName} {session.patient.lastName} ·{' '}
            {session.patient.registrationNumber}
          </DialogDescription>
        </DialogHeader>

        {session.phq9.selfHarmResponse > 0 && (
          <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Self-harm response requires attention</p>
              <p className="text-sm">
                PHQ-9 question 9 was scored {session.phq9.selfHarmResponse}.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Score
            label="PHQ-9"
            score={session.phq9.totalScore}
            severity={session.phq9.severity}
          />
          <Score
            label="GAD-7"
            score={session.gad7?.totalScore}
            severity={session.gad7?.severity}
          />
          <Score
            label="PCL-5"
            score={session.pcl5?.totalScore}
            severity={session.pcl5?.severity}
          />
        </div>

        <section className="rounded-xl border border-border/60 p-4">
          <h3 className="font-semibold">Demographic information</h3>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            <DetailItem
              label="Initial"
              value={session.demographics.initialOfParticipant || 'Not recorded'}
            />
            <DetailItem
              label="Marital status"
              value={readable(session.demographics.maritalStatus)}
            />
            <DetailItem
              label="Education"
              value={readable(session.demographics.educationLevel)}
            />
            <DetailItem
              label="Occupation"
              value={readable(session.demographics.occupation)}
            />
            <DetailItem
              label="Division"
              value={readable(session.demographics.division)}
            />
            <DetailItem
              label="Location"
              value={readable(session.demographics.locationType)}
            />
            <DetailItem
              label="Religion"
              value={readable(session.demographics.religion)}
            />
          </dl>
        </section>

        <section className="rounded-xl border border-border/60 p-4">
          <h3 className="font-semibold">Session information</h3>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            <DetailItem label="Outreach" value={session.outreach.name} />
            <DetailItem label="Station" value={session.station.name} />
            <DetailItem
              label="Recorded by"
              value={`${session.recordedBy.firstName} ${session.recordedBy.lastName}`}
            />
            <DetailItem
              label="Date"
              value={new Date(session.createdAt).toLocaleString()}
            />
            <DetailItem label="Gender" value={readable(session.patient.gender)} />
          </dl>
        </section>

        {notes.length > 0 && (
          <section className="rounded-xl border border-border/60 p-4">
            <h3 className="font-semibold">Clinical notes</h3>
            <div className="mt-3 space-y-3">
              {notes.map(([label, note]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{note}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <Button asChild className="h-11 w-full rounded-xl sm:w-auto">
          <Link href={`/service-queue/${session.queueEntryId}`}>
            Open patient chart
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function MentalHealthScreen() {
  const dispatch = useAppDispatch();
  const { list: outreaches } = useAppSelector((state) => state.outreaches);
  const { activeOutreachId } = useAppSelector(
    (state) => state.outreachContext,
  );
  const [sessions, setSessions] = useState<MentalHealthSession[]>([]);
  const [totalNumItems, setTotalNumItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [offset, setOffset] = useState(0);
  const [outreachFilter, setOutreachFilter] = useState(
    activeOutreachId || 'all',
  );
  const [selectedSession, setSelectedSession] =
    useState<MentalHealthSession | null>(null);

  useEffect(() => {
    dispatch(fetchOutreaches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    setOutreachFilter(activeOutreachId || 'all');
    setOffset(0);
  }, [activeOutreachId]);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response =
        await PHQ9ScreeningsSource.fetchMentalHealthSessionsRequest({
          limit: PAGE_SIZE,
          offset,
          search: debouncedSearch || undefined,
          outreachId:
            outreachFilter === 'all' ? undefined : outreachFilter,
        });
      setSessions(response?.items ?? []);
      setTotalNumItems(response?.paginationInfo?.totalNumItems ?? 0);
    } catch {
      setSessions([]);
      setTotalNumItems(0);
      setError('Unable to load mental health screenings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, offset, outreachFilter]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Mental Health
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Review screening results and demographic information across
              outreaches.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:bg-black/20 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOffset(0);
            }}
            placeholder="Search patient name or number..."
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <Select
          value={outreachFilter}
          onValueChange={(value) => {
            setOutreachFilter(value);
            setOffset(0);
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-[220px]">
            <SelectValue placeholder="All outreaches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outreaches</SelectItem>
            {outreaches.map((outreach) => (
              <SelectItem key={outreach.id} value={outreach.id}>
                {outreach.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-white/60 shadow-sm backdrop-blur-xl dark:bg-black/40">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadSessions}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/50 lg:hidden">
              {isLoading ? (
                <p className="p-8 text-center text-muted-foreground">
                  Loading screenings...
                </p>
              ) : sessions.length === 0 ? (
                <p className="p-8 text-center text-muted-foreground">
                  No mental health screenings found.
                </p>
              ) : (
                sessions.map((session) => (
                  <article key={session.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {session.patient.firstName}{' '}
                          {session.patient.lastName}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {session.patient.registrationNumber}
                        </p>
                      </div>
                      {session.phq9.selfHarmResponse > 0 && (
                        <Badge className="border-red-500/30 bg-red-500/10 text-red-700">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Attention
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
                      <Score
                        label="PHQ-9"
                        score={session.phq9.totalScore}
                        severity={session.phq9.severity}
                      />
                      <Score
                        label="GAD-7"
                        score={session.gad7?.totalScore}
                        severity={session.gad7?.severity}
                      />
                      <Score
                        label="PCL-5"
                        score={session.pcl5?.totalScore}
                        severity={session.pcl5?.severity}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.outreach.name}</span>
                      <span>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl"
                      onClick={() => setSelectedSession(session)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </Button>
                  </article>
                ))
              )}
            </div>

            <Table className="hidden lg:table">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>PHQ-9</TableHead>
                  <TableHead>GAD-7</TableHead>
                  <TableHead>PCL-5</TableHead>
                  <TableHead>Outreach / Station</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center">
                      Loading screenings...
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center">
                      No mental health screenings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {session.patient.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              {session.patient.firstName}{' '}
                              {session.patient.lastName}
                              {session.phq9.selfHarmResponse > 0 && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <p className="font-mono text-xs text-muted-foreground">
                              {session.patient.registrationNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <strong>{session.phq9.totalScore}</strong>
                          <SeverityBadge severity={session.phq9.severity} />
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.gad7 ? (
                          <div className="flex items-center gap-2">
                            <strong>{session.gad7.totalScore}</strong>
                            <SeverityBadge severity={session.gad7.severity} />
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {session.pcl5 ? (
                          <div className="flex items-center gap-2">
                            <strong>{session.pcl5.totalScore}</strong>
                            <SeverityBadge severity={session.pcl5.severity} />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{session.outreach.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.station.name}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.recordedBy.firstName}{' '}
                        {session.recordedBy.lastName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setSelectedSession(session)}
                          aria-label={`View screening for ${session.patient.firstName} ${session.patient.lastName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}

        {totalNumItems > 0 && (
          <div className="flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              Showing {offset + 1} to{' '}
              {Math.min(offset + PAGE_SIZE, totalNumItems)} of {totalNumItems}{' '}
              screenings
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={
                  offset + PAGE_SIZE >= totalNumItems || isLoading
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <SessionDetails
        session={selectedSession}
        open={Boolean(selectedSession)}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null);
        }}
      />
    </div>
  );
}
