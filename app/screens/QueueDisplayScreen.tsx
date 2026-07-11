'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, RefreshCw, Search, Stethoscope, X } from 'lucide-react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { fetchPublicQueueRequest } from '@/app/source/QueueEntriesSource';
import { fetchOutreachesRequest } from '@/app/source/OutreachesSource';
import { fetchStationsRequest } from '@/app/source/StationsSource';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface PublicQueueItem {
  id: string;
  patient: { firstName: string; lastName: string; registrationNumber: string };
  currentStation: { id: string; name: string } | null;
  status: 'WAITING' | 'IN_SERVICE' | 'COMPLETED' | 'NO_SHOW';
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  createdAt: string;
}

interface FilterOption {
  id: string;
  name: string;
}

const CARD_STYLES = {
  WAITING: {
    topBar: 'bg-amber-400',
    avatar: 'bg-amber-100 dark:bg-amber-900/30',
    avatarText: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/50',
    label: 'text-amber-600 dark:text-amber-400',
  },
  IN_SERVICE: {
    topBar: 'bg-blue-500',
    avatar: 'bg-blue-100 dark:bg-blue-900/30',
    avatarText: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/50',
    label: 'text-blue-600 dark:text-blue-400',
  },
};

const PRIORITY_BADGE: Record<string, string> = {
  EMERGENCY: 'bg-red-500/10 text-red-600 border-red-500/30',
  URGENT: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

function waitTime(createdAt: string) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function QueueDisplayScreen() {
  const searchParams = useSearchParams();
  const urlOutreachId = searchParams.get('outreachId') ?? undefined;

  const limit = 40;
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [outreachFilter, setOutreachFilter] = useState<string | undefined>(urlOutreachId);
  const [stationFilter, setStationFilter] = useState<string | undefined>(undefined);

  const [items, setItems] = useState<PublicQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [outreaches, setOutreaches] = useState<FilterOption[]>([]);
  const [stations, setStations] = useState<FilterOption[]>([]);

  useEffect(() => {
    fetchOutreachesRequest({ limit: 100 })
      .then((res: any) =>
        setOutreaches((res?.items ?? []).map((o: any) => ({ id: o.id, name: o.name })))
      )
      .catch(() => {});
    fetchStationsRequest({ limit: 100 })
      .then((res: any) =>
        setStations((res?.items ?? []).map((s: any) => ({ id: s.id, name: s.name })))
      )
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { limit, offset };
      if (outreachFilter) params.outreachId = outreachFilter;
      if (stationFilter) params.currentStationId = stationFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await fetchPublicQueueRequest(params);
      setItems(res?.items ?? []);
      setTotal(res?.paginationInfo?.totalNumItems ?? 0);
      setLastRefreshed(new Date());
    } catch {
      // silently ignore — public page, no auth errors to surface
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, outreachFilter, stationFilter, debouncedSearch]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const resetOffset = () => setOffset(0);
  const hasFilters = !!searchTerm || !!outreachFilter || !!stationFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service Queue</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Live view — patients currently waiting or in service
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={isLoading}
              className="rounded-xl gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetOffset(); }}
              placeholder="Search by name or reg number…"
              className="pl-9 h-10 rounded-xl bg-white/70 dark:bg-black/50"
            />
          </div>

          {outreaches.length > 0 && (
            <Select
              value={outreachFilter ?? 'all'}
              onValueChange={(v) => { setOutreachFilter(v === 'all' ? undefined : v); resetOffset(); }}
            >
              <SelectTrigger className="h-10 w-[180px] rounded-xl bg-white/70 dark:bg-black/50">
                <SelectValue placeholder="All outreaches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outreaches</SelectItem>
                {outreaches.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {stations.length > 0 && (
            <Select
              value={stationFilter ?? 'all'}
              onValueChange={(v) => { setStationFilter(v === 'all' ? undefined : v); resetOffset(); }}
            >
              <SelectTrigger className="h-10 w-[180px] rounded-xl bg-white/70 dark:bg-black/50">
                <SelectValue placeholder="All stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stations</SelectItem>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl gap-1.5 text-muted-foreground"
              onClick={() => {
                setSearchTerm('');
                setOutreachFilter(undefined);
                setStationFilter(undefined);
                resetOffset();
              }}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {total} patient{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
            Waiting
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
            In Service
          </span>
        </div>

        {/* Queue grid */}
        {isLoading && items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">Loading queue…</div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40">
            {debouncedSearch
              ? `No patients found for "${debouncedSearch}".`
              : 'No patients currently in the queue.'}
          </div>
        )}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {items.map((entry) => {
              const style = CARD_STYLES[entry.status as keyof typeof CARD_STYLES] ?? CARD_STYLES.WAITING;
              const prioCls = PRIORITY_BADGE[entry.priority];
              return (
                <div
                  key={entry.id}
                  className={`rounded-2xl border bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col ${style.border}`}
                >
                  <div className={`h-1.5 w-full ${style.topBar}`} />

                  <div className="p-3 flex flex-col items-center gap-2 text-center flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${style.avatar}`}>
                      <span className={`text-xs font-bold font-mono ${style.avatarText}`}>
                        {entry.patient.registrationNumber.slice(-3)}
                      </span>
                    </div>

                    <div className="w-full space-y-0.5">
                      <p className="font-semibold text-xs leading-tight line-clamp-2">
                        {entry.patient.firstName} {entry.patient.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {entry.patient.registrationNumber}
                      </p>
                    </div>

                    {entry.currentStation && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground w-full justify-center">
                        <Stethoscope className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{entry.currentStation.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      <span>{waitTime(entry.createdAt)}</span>
                    </div>

                    <span className={`text-[10px] font-semibold ${style.label}`}>
                      {entry.status === 'IN_SERVICE' ? 'In Service' : 'Waiting'}
                    </span>

                    {prioCls && (
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${prioCls}`}>
                        {entry.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-foreground">{offset + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(offset + limit, total)}</span>{' '}
              of{' '}
              <span className="font-medium text-foreground">{total}</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pt-2">
          Auto-refreshes every 30 seconds · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
