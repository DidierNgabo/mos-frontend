/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ClipboardList } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchMyObservations } from '@/app/store/observations';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

function severityBadge(severity: string | null | undefined) {
  if (!severity) return <span className="text-muted-foreground text-xs">—</span>;
  const map: Record<string, string> = {
    MILD: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    MODERATE: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    SEVERE: 'bg-red-500/10 text-red-700 border-red-500/20',
  };
  return (
    <Badge className={map[severity] ?? 'bg-muted text-muted-foreground border-border'}>
      {severity}
    </Badge>
  );
}

export default function MyObservationsScreen() {
  const dispatch = useAppDispatch();
  const { myList: observations, myTotalNumItems, isLoadingMy } = useAppSelector(
    (s) => s.observations,
  );
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    setOffset(0);
  }, [activeOutreachId]);

  useEffect(() => {
    dispatch(
      fetchMyObservations({
        limit,
        offset,
        outreachId: activeOutreachId || undefined,
        search: debouncedSearch || undefined,
      }),
    );
  }, [dispatch, offset, debouncedSearch, activeOutreachId]);

  const totalPages = Math.ceil(myTotalNumItems / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            My Observations
          </h2>
          <p className="text-muted-foreground mt-1">
            Observations you recorded across outreaches.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or diagnosis..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOffset(0);
            }}
            className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
        </div>
        <span className="text-sm text-muted-foreground ml-auto shrink-0">
          {myTotalNumItems} record{myTotalNumItems !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatment Given</TableHead>
              <TableHead>Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMy ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : observations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ClipboardList className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No observations found{activeOutreachId ? ' for this outreach' : ''}.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              observations.map((obs: any) => (
                <TableRow key={obs.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {obs.createdAt
                      ? new Date(obs.createdAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {obs.patient ? (
                      <Link
                        href={`/patients/${obs.patient.id}`}
                        className="font-medium hover:underline text-primary"
                      >
                        {obs.patient.firstName} {obs.patient.lastName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {obs.station?.name ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">
                    <span className="line-clamp-2">{obs.diagnosis ?? '—'}</span>
                    {obs.diagnosisCode && (
                      <span className="text-xs text-muted-foreground block">{obs.diagnosisCode}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">
                    <span className="line-clamp-2">{obs.treatmentGiven ?? <span className="text-muted-foreground">—</span>}</span>
                  </TableCell>
                  <TableCell>
                    {obs.followUpRequired ? (
                      <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                        Required
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">None</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= myTotalNumItems}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
