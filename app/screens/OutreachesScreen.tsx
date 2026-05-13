'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Eye, MapPin, Calendar, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchOutreaches, createOutreach, updateOutreach, deleteOutreach } from '@/app/store/outreaches';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
import { Badge } from '@/app/components/ui/badge';
import { OutreachModal } from '@/app/components/modals/OutreachModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { Outreach } from '@/app/store/outreaches/outreaches.types';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20';
    case 'PLANNED':
      return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20';
    case 'CLOSED':
      return 'bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

export default function OutreachesScreen() {
  const dispatch = useAppDispatch();
  const { list: outreaches, totalNumItems, isLoadingOutreaches, isDeletingOutreach } = useAppSelector((state) => state.outreaches);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Pagination and Filters
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedOutreach, setSelectedOutreach] = useState<Outreach | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [outreachToDelete, setOutreachToDelete] = useState<Outreach | null>(null);

  const loadData = () => {
    dispatch(fetchOutreaches({
      limit,
      offset,
      search: debouncedSearch || undefined,
      status: statusFilter,
    }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch, offset, debouncedSearch, statusFilter]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleFilterChange = (val: string) => {
    setOffset(0);
    setStatusFilter(val === 'all' ? undefined : val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', outreach: Outreach | null = null) => {
    setModalMode(mode);
    setSelectedOutreach(outreach);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!outreachToDelete) return;
    try {
      await dispatch(deleteOutreach(outreachToDelete.id)).unwrap();
      toast.success('Outreach deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete outreach');
    } finally {
      setDeleteDialogOpen(false);
      setOutreachToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createOutreach(values)).unwrap();
        toast.success('Outreach created successfully.');
      } else if (modalMode === 'edit' && selectedOutreach) {
        await dispatch(updateOutreach({ id: selectedOutreach.id, data: values })).unwrap();
        toast.success('Outreach updated successfully.');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} outreach`);
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Outreaches
          </h2>
          <p className="text-muted-foreground mt-1">Manage and track medical outreach programs.</p>
        </div>
        <Can do="create" on="Outreach">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Outreach
          </Button>
        </Can>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search outreaches..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOffset(0);
            }}
            className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
        </div>
        <div className="w-full sm:max-w-[150px]">
          <Select onValueChange={handleFilterChange}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Created By</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="font-semibold">Members</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingOutreaches ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading outreaches...
                </TableCell>
              </TableRow>
            ) : outreaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No outreaches found.
                </TableCell>
              </TableRow>
            ) : (
              outreaches.map((outreach) => (
                <TableRow key={outreach.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-foreground font-semibold">{outreach.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 opacity-70" />
                      {outreach.location || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      <span>{formatDate(outreach.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {outreach.createdBy
                      ? `${outreach.createdBy.firstName} ${outreach.createdBy.lastName}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      {formatDate(outreach.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5 opacity-70" />
                      <span className="font-medium text-foreground">{outreach.members?.length ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusBadgeVariant(outreach.status)} font-normal`}>
                      {outreach.status || 'UNKNOWN'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('view', outreach)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                        </DropdownMenuItem>
                        <Can do="update" on="Outreach">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('edit', outreach)}>
                            <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                          </DropdownMenuItem>
                        </Can>
                        <Can do="delete" on="Outreach">
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setOutreachToDelete(outreach);
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

        {/* Pagination Footer */}
        {totalNumItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{offset + 1}</span> to <span className="font-medium text-foreground">{Math.min(offset + limit, totalNumItems)}</span> of <span className="font-medium text-foreground">{totalNumItems}</span> outreaches
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => handlePageChange(Math.max(0, offset - limit))}
                disabled={offset === 0 || isLoadingOutreaches}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => handlePageChange(offset + limit)}
                disabled={offset + limit >= totalNumItems || isLoadingOutreaches}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <OutreachModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedOutreach}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingOutreach}
        title="Delete Outreach"
        description={`Are you sure you want to delete "${outreachToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
