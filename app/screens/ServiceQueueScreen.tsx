'use client';

import { useEffect, useState, useCallback, type ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCw, AlertTriangle, CheckCircle2, XCircle, ArrowRight, MoreHorizontal, Stethoscope, FlaskConical, Ambulance, Play, Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { useDebounce } from '@/app/hooks/useDebounce';
import { fetchMyQueue, updateQueueStatus } from '@/app/store/queue-entries';
import { fetchStations } from '@/app/store/stations';
import { QueueEntry, QueuePriority, QueueStatus } from '@/app/store/queue-entries/queue-entries.types';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';
import { QueueEntryModal } from '@/app/components/modals/QueueEntryModal';
import { MovePatientModal } from '@/app/components/modals/MovePatientModal';
import { ObservationModal } from '@/app/components/modals/ObservationModal';
import { LabResultModal } from '@/app/components/modals/LabResultModal';
import { CommunicableDiseaseModal } from '@/app/components/modals/CommunicableDiseaseModal';
import { TransferModal } from '@/app/components/modals/TransferModal';

const PRIORITY_CONFIG: Record<QueuePriority, { label: string; className: string }> = {
  EMERGENCY: { label: 'Emergency', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
  URGENT:    { label: 'Urgent',    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  NORMAL:    { label: 'Normal',    className: 'bg-slate-100 text-slate-600 border-slate-300' },
};

const STATUS_CONFIG: Record<QueueStatus, { label: string; icon: ElementType; className: string }> = {
  WAITING:    { label: 'Waiting',    icon: Clock,         className: 'text-amber-600' },
  IN_SERVICE: { label: 'In Service', icon: Play,          className: 'text-blue-600' },
  COMPLETED:  { label: 'Completed',  icon: CheckCircle2,  className: 'text-green-600' },
  NO_SHOW:    { label: 'No Show',    icon: XCircle,       className: 'text-slate-400' },
};

function waitTime(createdAt: string) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function ServiceQueueScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: entries, isLoadingQueue, totalNumItems, queueScope } =
    useAppSelector((s) => s.queueEntries);
  const { list: stations } = useAppSelector((s) => s.stations);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);
  const { user } = useAppSelector((s) => s.auth);

  const isClinical =
    user?.roles?.some((r: string) =>
      ['NURSE', 'DOCTOR', 'PSYCHOLOGIST'].includes(r),
    ) ?? false;

  const limit = 20;
  const [offset, setOffset] = useState(0);
  const [stationFilter, setStationFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modal state
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [moveModal, setMoveModal] = useState<{ open: boolean; entry: QueueEntry | null }>({ open: false, entry: null });
  const [obsModal, setObsModal] = useState<{ open: boolean; entry: QueueEntry | null }>({ open: false, entry: null });
  const [labModal, setLabModal] = useState<{ open: boolean; entry: QueueEntry | null }>({ open: false, entry: null });
  const [cdModal, setCdModal] = useState<{ open: boolean; entry: QueueEntry | null }>({ open: false, entry: null });
  const [transferModal, setTransferModal] = useState<{ open: boolean; entry: QueueEntry | null }>({ open: false, entry: null });

  const loadQueue = useCallback(() => {
    const params: Record<string, unknown> = { limit, offset };
    if (!isClinical && stationFilter && stationFilter !== 'unassigned') params.currentStationId = stationFilter;
    if (activeOutreachId) params.outreachId = activeOutreachId;
    if (statusFilter !== 'active' && statusFilter !== 'all') params.status = statusFilter;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    dispatch(fetchMyQueue(params));
  }, [dispatch, isClinical, stationFilter, activeOutreachId, statusFilter, debouncedSearch, limit, offset]);

  useEffect(() => {
    dispatch(fetchStations({ limit: 100, outreachId: activeOutreachId || undefined }));
  }, [dispatch, activeOutreachId]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleStart = async (entry: QueueEntry) => {
    try {
      await dispatch(updateQueueStatus({ id: entry.id, data: { status: 'IN_SERVICE' } })).unwrap();
      toast.success('Patient status updated to In Service');
      router.push(`/service-queue/${entry.id}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleComplete = async (entry: QueueEntry) => {
    try {
      await dispatch(updateQueueStatus({ id: entry.id, data: { status: 'COMPLETED' } })).unwrap();
      toast.success('Visit marked as completed');
      loadQueue();
    } catch {
      toast.error('Failed to complete visit');
    }
  };

  const handleNoShow = async (entry: QueueEntry) => {
    try {
      await dispatch(updateQueueStatus({ id: entry.id, data: { status: 'NO_SHOW' } })).unwrap();
      toast.success('Marked as no show');
      loadQueue();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const baseEntries = stationFilter === 'unassigned'
    ? entries.filter((e) => !e.currentStation)
    : entries;
  const displayEntries = statusFilter === 'active'
    ? baseEntries.filter((e) => ['WAITING', 'IN_SERVICE'].includes(e.status))
    : statusFilter === 'all'
      ? baseEntries
      : baseEntries.filter((e) => e.status === statusFilter);

  const waitingCount = entries.filter((e) => e.status === 'WAITING').length;
  const inServiceCount = entries.filter((e) => e.status === 'IN_SERVICE').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Service Queue
          </h2>
          <p className="text-muted-foreground mt-1">
            {queueScope?.source === 'TEAM'
              ? `Patients waiting at your team station${queueScope.stations.length === 1 ? '' : 's'}: ${queueScope.stations.map((station) => station.name).join(', ')}.`
              : queueScope?.source === 'INDIVIDUAL'
                ? `Patients waiting at your assigned station: ${queueScope.stations[0]?.name}.`
                : queueScope?.source === 'NONE'
                  ? 'No individual or team station is assigned to you.'
                  : 'Patients waiting across service stations.'}{' '}
            Auto-refreshes every 30 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadQueue} className="rounded-xl gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Can do="create" on="QueueEntry">
            <Button
              onClick={() => setQueueModalOpen(true)}
              className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Add to Queue
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Waiting', value: waitingCount, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'In Service', value: inServiceCount, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Total in Queue', value: totalNumItems, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex flex-col gap-1`}>
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => { setSearchTerm(event.target.value); setOffset(0); }}
            placeholder="Search patient name or ID..."
            aria-label="Search queue by patient name or registration number"
            className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border pl-9 pr-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setOffset(0); }}
              aria-label="Clear patient search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {!isClinical && (
          <div className="w-full sm:max-w-55">
            <Select value={stationFilter ?? 'all'} onValueChange={(v) => { setStationFilter(v === 'all' ? undefined : v); setOffset(0); }}>
              <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="w-full sm:max-w-45">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setOffset(0); }}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active (Waiting + In Service)</SelectItem>
              <SelectItem value="WAITING">Waiting</SelectItem>
              <SelectItem value="IN_SERVICE">In Service</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Queue cards */}
      <div className="space-y-3">
        {isLoadingQueue && displayEntries.length === 0 && (
          <div className="text-center text-muted-foreground py-16">Loading queue…</div>
        )}
        {!isLoadingQueue && displayEntries.length === 0 && (
          <div className="text-center text-muted-foreground py-16 bg-white/60 dark:bg-black/40 rounded-2xl border border-border/50">
            {debouncedSearch
              ? `No patients found for "${debouncedSearch}".`
              : 'No patients in queue.'}
          </div>
        )}
        {displayEntries.map((entry) => {
          const prio = PRIORITY_CONFIG[entry.priority];
          const stat = STATUS_CONFIG[entry.status];
          const StatIcon = stat.icon;
          return (
            <div
              key={entry.id}
              className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md cursor-pointer"
              onClick={() => router.push(`/service-queue/${entry.id}`)}
            >
              {/* Patient info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={prio.className}>{prio.label}</Badge>
                  <span className="font-semibold text-sm">{entry.patient.firstName} {entry.patient.lastName}</span>
                  <span className="text-xs text-muted-foreground font-mono">{entry.patient.registrationNumber}</span>
                </div>
                {entry.chiefComplaint && (
                  <p className="text-sm text-muted-foreground truncate">{entry.chiefComplaint}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {waitTime(entry.createdAt)}
                  </span>
                  {entry.currentStation && (
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" /> {entry.currentStation.name}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 font-medium ${stat.className}`}>
                    <StatIcon className="h-3 w-3" /> {stat.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {entry.status === 'WAITING' && (
                  <Can do="update" on="QueueEntry">
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-8" onClick={() => handleStart(entry)}>
                      <Play className="h-3.5 w-3.5" /> Start
                    </Button>
                  </Can>
                )}
                {entry.status === 'IN_SERVICE' && (
                  <Can do="update" on="QueueEntry">
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-8 text-green-600 border-green-500/30 hover:bg-green-50" onClick={() => handleComplete(entry)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                    </Button>
                  </Can>
                )}
                <Can do="update" on="QueueEntry">
                  <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-8" onClick={() => setMoveModal({ open: true, entry })}>
                    <ArrowRight className="h-3.5 w-3.5" /> Move
                  </Button>
                </Can>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl">
                    <DropdownMenuLabel>Clinical Actions</DropdownMenuLabel>
                    <Can do="create" on="Observation">
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setObsModal({ open: true, entry })}>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" /> Add Observation
                      </DropdownMenuItem>
                    </Can>
                    <Can do="create" on="LabResult">
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setLabModal({ open: true, entry })}>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" /> Add Lab Result
                      </DropdownMenuItem>
                    </Can>
                    <Can do="create" on="CommunicableDisease">
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setCdModal({ open: true, entry })}>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" /> Disease Screening
                      </DropdownMenuItem>
                    </Can>
                    <Can do="create" on="Transfer">
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setTransferModal({ open: true, entry })}>
                        <Ambulance className="h-4 w-4 text-muted-foreground" /> Refer to Facility
                      </DropdownMenuItem>
                    </Can>
                    <DropdownMenuSeparator />
                    <Can do="update" on="QueueEntry">
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        onClick={() => handleNoShow(entry)}
                      >
                        <XCircle className="h-4 w-4" /> Mark No Show
                      </DropdownMenuItem>
                    </Can>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalNumItems > limit && (
        <div className="flex items-center justify-between px-2 py-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">{offset + 1}</span>{' '}
            to{' '}
            <span className="font-medium text-foreground">{Math.min(offset + limit, totalNumItems)}</span>{' '}
            of{' '}
            <span className="font-medium text-foreground">{totalNumItems}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-9"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0 || isLoadingQueue}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-9"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= totalNumItems || isLoadingQueue}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <QueueEntryModal
        open={queueModalOpen}
        onOpenChange={setQueueModalOpen}
        onSuccess={loadQueue}
      />
      <MovePatientModal
        open={moveModal.open}
        onOpenChange={(open) => setMoveModal((s) => ({ ...s, open }))}
        entry={moveModal.entry}
        onSuccess={loadQueue}
      />
      <ObservationModal
        open={obsModal.open}
        onOpenChange={(open) => setObsModal((s) => ({ ...s, open }))}
        entry={obsModal.entry}
      />
      <LabResultModal
        open={labModal.open}
        onOpenChange={(open) => setLabModal((s) => ({ ...s, open }))}
        entry={labModal.entry}
      />
      <CommunicableDiseaseModal
        open={cdModal.open}
        onOpenChange={(open) => setCdModal((s) => ({ ...s, open }))}
        entry={cdModal.entry}
      />
      <TransferModal
        open={transferModal.open}
        onOpenChange={(open) => setTransferModal((s) => ({ ...s, open }))}
        entry={transferModal.entry}
      />
    </div>
  );
}
