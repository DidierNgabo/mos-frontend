/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
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
  fetchVitalSigns,
  createVitalSign,
  updateVitalSign,
  deleteVitalSign,
} from '@/app/store/vital-signs';
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
import { VitalSign } from '@/app/store/vital-signs/vital-signs.types';
import { VitalSignModal } from '@/app/components/modals/VitalSignModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

function BmiBadge({ bmi }: { bmi: number }) {
  if (bmi < 18.5)
    return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{bmi.toFixed(1)} UW</Badge>;
  if (bmi < 25)
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{bmi.toFixed(1)} NW</Badge>;
  if (bmi < 30)
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{bmi.toFixed(1)} OW</Badge>;
  return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{bmi.toFixed(1)} OB</Badge>;
}

export default function VitalSignsScreen() {
  const dispatch = useAppDispatch();
  const {
    list: vitalSigns,
    totalNumItems,
    isLoadingVitalSigns,
    isDeletingVitalSign,
  } = useAppSelector((s) => s.vitalSigns);
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
  const [selectedVitalSign, setSelectedVitalSign] = useState<VitalSign | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vitalSignToDelete, setVitalSignToDelete] = useState<VitalSign | null>(null);

  const loadData = () => {
    dispatch(
      fetchVitalSigns({
        limit,
        offset,
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
    vitalSign: VitalSign | null = null,
  ) => {
    setModalMode(mode);
    setSelectedVitalSign(vitalSign);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vitalSignToDelete) return;
    try {
      await dispatch(deleteVitalSign(vitalSignToDelete.id)).unwrap();
      toast.success('Vital sign record deleted');
      loadData();
    } catch {
      toast.error('Failed to delete vital sign record');
    } finally {
      setDeleteDialogOpen(false);
      setVitalSignToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createVitalSign(values)).unwrap();
        toast.success('Vital signs recorded successfully');
      } else if (modalMode === 'edit' && selectedVitalSign) {
        await dispatch(
          updateVitalSign({ id: selectedVitalSign.id, data: values }),
        ).unwrap();
        toast.success('Vital signs updated successfully');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} vital signs`);
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Vital Signs
          </h2>
          <p className="text-muted-foreground mt-1">
            Record and review patient vital signs across outreaches.
          </p>
        </div>
        <Can do="create" on="VitalSign">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Vital Signs
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vital signs..."
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
              <TableHead className="font-semibold">Patient</TableHead>
              <TableHead className="font-semibold">Station</TableHead>
              <TableHead className="font-semibold">Blood Pressure</TableHead>
              <TableHead className="font-semibold">Pulse / Temp</TableHead>
              <TableHead className="font-semibold">BMI</TableHead>
              <TableHead className="font-semibold">Recorded By</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingVitalSigns ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading vital signs...
                </TableCell>
              </TableRow>
            ) : vitalSigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No vital signs recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              vitalSigns.map((vs) => (
                <TableRow key={vs.id} className="transition-colors hover:bg-muted/50 group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                        {vs.patient?.firstName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p>{vs.patient?.firstName} {vs.patient?.lastName}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {vs.patient?.registrationNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {vs.station?.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {vs.bloodPressureSystolic}/{vs.bloodPressureDiastolic}{' '}
                      <span className="text-muted-foreground text-xs">mmHg</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{vs.pulseRate} <span className="text-muted-foreground text-xs">bpm</span></p>
                    <p>{vs.temperature} <span className="text-muted-foreground text-xs">°C</span></p>
                  </TableCell>
                  <TableCell>
                    <BmiBadge bmi={vs.bmi} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {vs.recordedBy?.firstName} {vs.recordedBy?.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(vs.createdAt).toLocaleDateString()}
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
                          onClick={() => handleOpenModal('view', vs)}
                        >
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                        </DropdownMenuItem>
                        <Can do="update" on="VitalSign">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleOpenModal('edit', vs)}
                          >
                            <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                          </DropdownMenuItem>
                        </Can>
                        <Can do="delete" on="VitalSign">
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setVitalSignToDelete(vs);
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
                disabled={offset === 0 || isLoadingVitalSigns}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= totalNumItems || isLoadingVitalSigns}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <VitalSignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedVitalSign}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingVitalSign}
        title="Delete Vital Signs Record"
        description={`Are you sure you want to delete the vital signs record for ${vitalSignToDelete?.patient?.firstName} ${vitalSignToDelete?.patient?.lastName}? This action cannot be undone.`}
      />
    </div>
  );
}
