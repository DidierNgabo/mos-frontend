'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchStations, createStation, updateStation, deleteStation } from '@/app/store/stations';
import { fetchOutreaches } from '@/app/store/outreaches';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Station } from '@/app/store/stations/stations.types';
import { StationModal } from '@/app/components/modals/StationModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  CLINICAL: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  LAB: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  PHARMACY: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  SCREENING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  RADIOLOGY: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

export default function StationsScreen() {
  const dispatch = useAppDispatch();
  const { list: stations, totalNumItems, isLoadingStations, isDeletingStation } = useAppSelector((s) => s.stations);
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [outreachFilter, setOutreachFilter] = useState<string | undefined>(activeOutreachId || undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    setOutreachFilter(activeOutreachId || undefined);
    setOffset(0);
  }, [activeOutreachId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);

  const loadData = () => {
    dispatch(fetchStations({
      limit,
      offset,
      search: debouncedSearch || undefined,
      outreachId: outreachFilter || undefined,
      type: typeFilter || undefined,
    }));
  };

  useEffect(() => {
    dispatch(fetchOutreaches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [offset, debouncedSearch, outreachFilter, typeFilter]);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', station: Station | null = null) => {
    setModalMode(mode);
    setSelectedStation(station);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!stationToDelete) return;
    try {
      await dispatch(deleteStation(stationToDelete.id)).unwrap();
      toast.success('Station deleted successfully');
      loadData();
    } catch {
      toast.error('Failed to delete station');
    } finally {
      setDeleteDialogOpen(false);
      setStationToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createStation(values)).unwrap();
        toast.success('Station created successfully');
      } else if (modalMode === 'edit' && selectedStation) {
        await dispatch(updateStation({ id: selectedStation.id, data: values })).unwrap();
        toast.success('Station updated successfully');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} station`);
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Stations
          </h2>
          <p className="text-muted-foreground mt-1">Manage clinical stations within outreaches.</p>
        </div>
        <Can do="create" on="Station">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Station
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
            className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
        </div>
        <div className="w-full sm:max-w-[200px]">
          <Select onValueChange={(v) => { setOffset(0); setOutreachFilter(v === 'all' ? undefined : v); }}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="All Outreaches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outreaches</SelectItem>
              {outreaches.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:max-w-[150px]">
          <Select onValueChange={(v) => { setOffset(0); setTypeFilter(v === 'all' ? undefined : v); }}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {['CLINICAL', 'LAB', 'PHARMACY', 'SCREENING', 'RADIOLOGY'].map((t) => (
                <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
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
              <TableHead className="font-semibold">Station</TableHead>
              <TableHead className="font-semibold">Outreach</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Staff</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingStations ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading stations...</TableCell>
              </TableRow>
            ) : stations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No stations found.</TableCell>
              </TableRow>
            ) : stations.map((station) => (
              <TableRow key={station.id} className="transition-colors hover:bg-muted/50 group">
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell className="text-muted-foreground">{station.outreach?.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={TYPE_COLORS[station.type] || 'bg-primary/10 text-primary border-primary/20'}>
                    {station.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{station.userCount ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={station.isActive ? 'default' : 'destructive'} className={station.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20'}>
                    {station.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('view', station)}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                      </DropdownMenuItem>
                      <Can do="update" on="Station">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('edit', station)}>
                          <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                        </DropdownMenuItem>
                      </Can>
                      <Can do="delete" on="Station">
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => { setStationToDelete(station); setDeleteDialogOpen(true); }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalNumItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{offset + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(offset + limit, totalNumItems)}</span> of{' '}
              <span className="font-medium text-foreground">{totalNumItems}</span> stations
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0 || isLoadingStations}>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setOffset(offset + limit)} disabled={offset + limit >= totalNumItems || isLoadingStations}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <StationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedStation}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingStation}
        title="Delete Station"
        description={`Are you sure you want to delete station "${stationToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
