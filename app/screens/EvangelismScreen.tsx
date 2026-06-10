/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  MoreHorizontal,
  FileEdit,
  Trash,
  Eye,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import {
  fetchEvangelismRecords,
  createEvangelismRecord,
  updateEvangelismRecord,
  deleteEvangelismRecord,
} from '@/app/store/evangelism-records';
import { fetchOutreaches } from '@/app/store/outreaches';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { EvangelismRecord } from '@/app/store/evangelism-records/evangelism-records.types';
import { EvangelismRecordModal } from '@/app/components/modals/EvangelismRecordModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

function DecisionBadges({ record }: { record: EvangelismRecord }) {
  const badges: { label: string; className: string }[] = [];
  if (record.acceptedJesus) {
    badges.push({ label: 'Accepted Jesus', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' });
  }
  if (record.isSaved) {
    badges.push({ label: 'Saved', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' });
  }
  if (record.followUp) {
    badges.push({ label: 'Follow-up', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' });
  }
  if (record.notSure) {
    badges.push({ label: 'Undecided', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' });
  }
  if (record.declined) {
    badges.push({ label: 'Declined', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' });
  }
  if (badges.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <Badge key={b.label} className={b.className}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}

export default function EvangelismScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    list: records,
    totalNumItems,
    isLoadingEvangelismRecords,
    isDeletingEvangelismRecord,
  } = useAppSelector((s) => s.evangelismRecords);
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [outreachFilter, setOutreachFilter] = useState<string | undefined>(activeOutreachId || undefined);

  useEffect(() => {
    setOutreachFilter(activeOutreachId || undefined);
    setOffset(0);
  }, [activeOutreachId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<EvangelismRecord | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<EvangelismRecord | null>(null);

  const loadData = () => {
    dispatch(
      fetchEvangelismRecords({
        limit,
        offset,
        search: debouncedSearch || undefined,
        outreachId: outreachFilter || undefined,
      }),
    );
  };

  useEffect(() => {
    dispatch(fetchOutreaches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [offset, debouncedSearch, outreachFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenModal = (
    mode: 'create' | 'edit' | 'view',
    record: EvangelismRecord | null = null,
  ) => {
    setModalMode(mode);
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await dispatch(deleteEvangelismRecord(recordToDelete.id)).unwrap();
      toast.success('Evangelism record deleted');
      loadData();
    } catch {
      toast.error('Failed to delete evangelism record');
    } finally {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createEvangelismRecord(values)).unwrap();
        toast.success('Evangelism record saved successfully');
      } else if (modalMode === 'edit' && selectedRecord) {
        await dispatch(
          updateEvangelismRecord({ id: selectedRecord.id, data: values }),
        ).unwrap();
        toast.success('Evangelism record updated successfully');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} evangelism record`);
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Evangelism
          </h2>
          <p className="text-muted-foreground mt-1">
            Track conversations and decisions from outreach evangelism efforts.
          </p>
        </div>
        <Can do="create" on="EvangelismRecord">
          <Button
            onClick={() => router.push('/evangelism/new')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, prayer request..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOffset(0);
            }}
            className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
        </div>
        <div className="w-full sm:max-w-[200px]">
          <Select
            value={outreachFilter || 'all'}
            onValueChange={(v) => {
              setOffset(0);
              setOutreachFilter(v === 'all' ? undefined : v);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="All Outreaches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outreaches</SelectItem>
              {outreaches.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Patient</TableHead>
              <TableHead className="font-semibold">Decision</TableHead>
              <TableHead className="font-semibold">Done By</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingEvangelismRecords ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading evangelism records...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No evangelism records yet.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="transition-colors hover:bg-muted/50 group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                        {record.name?.charAt(0) || '?'}
                      </div>
                      <p>{record.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {record.patient
                      ? `${record.patient.firstName} ${record.patient.lastName}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <DecisionBadges record={record} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {record.doneBy?.firstName} {record.doneBy?.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleOpenModal('view', record)}
                        >
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                        </DropdownMenuItem>
                        <Can do="update" on="EvangelismRecord">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleOpenModal('edit', record)}
                          >
                            <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                          </DropdownMenuItem>
                        </Can>
                        <Can do="delete" on="EvangelismRecord">
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setRecordToDelete(record);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </Can>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalNumItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-foreground">{offset + 1}</span>{' '}
              to{' '}
              <span className="font-medium text-foreground">
                {Math.min(offset + limit, totalNumItems)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-foreground">{totalNumItems}</span>{' '}
              records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0 || isLoadingEvangelismRecords}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= totalNumItems || isLoadingEvangelismRecords}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <EvangelismRecordModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedRecord}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingEvangelismRecord}
        title="Delete Evangelism Record"
        description={`Are you sure you want to delete the evangelism record for ${recordToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
