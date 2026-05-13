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
  ListPlus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from '@/app/store/patients';
import { fetchOutreaches } from '@/app/store/outreaches';
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
import { Patient } from '@/app/store/patients/patients.types';
import { PatientModal } from '@/app/components/modals/PatientModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { QueueEntryModal } from '@/app/components/modals/QueueEntryModal';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

export default function PatientsScreen() {
  const dispatch = useAppDispatch();
  const {
    list: patients,
    totalNumItems,
    isLoadingPatients,
    isDeletingPatient,
  } = useAppSelector((s) => s.patients);
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [outreachFilter, setOutreachFilter] = useState<string | undefined>(
    activeOutreachId || undefined,
  );

  useEffect(() => {
    setOutreachFilter(activeOutreachId || undefined);
    setOffset(0);
  }, [activeOutreachId]);
  const [genderFilter, setGenderFilter] = useState<string | undefined>(
    undefined,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create',
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queuePatientId, setQueuePatientId] = useState<string | undefined>();

  const loadData = () => {
    dispatch(
      fetchPatients({
        limit,
        offset,
        search: debouncedSearch || undefined,
        outreachId: outreachFilter || undefined,
        gender: genderFilter || undefined,
      }),
    );
  };

  useEffect(() => {
    dispatch(fetchOutreaches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [offset, debouncedSearch, outreachFilter, genderFilter]);

  const handleOpenModal = (
    mode: 'create' | 'edit' | 'view',
    patient: Patient | null = null,
  ) => {
    setModalMode(mode);
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await dispatch(deletePatient(patientToDelete.id)).unwrap();
      toast.success('Patient record deleted');
      loadData();
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        const newPatient = await dispatch(createPatient(values)).unwrap();
        toast.success('Patient registered successfully', {
          action: {
            label: 'Add to Queue',
            onClick: () => {
              setQueuePatientId(newPatient.id);
              setQueueModalOpen(true);
            },
          },
        });
      } else if (modalMode === 'edit' && selectedPatient) {
        await dispatch(
          updatePatient({ id: selectedPatient.id, data: values }),
        ).unwrap();
        toast.success('Patient updated successfully');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} patient`);
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Patients
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage patient registrations across outreaches.
          </p>
        </div>
        <Can do="create" on="Patient">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Patient
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
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
        <div className="w-full sm:max-w-[130px]">
          <Select
            onValueChange={(v) => {
              setOffset(0);
              setGenderFilter(v === 'all' ? undefined : v);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
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
              <TableHead className="font-semibold">Reg. No.</TableHead>
              <TableHead className="font-semibold">Outreach</TableHead>
              <TableHead className="font-semibold">Gender</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingPatients ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading patients...
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="transition-colors hover:bg-muted/50 group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                        {patient.firstName?.charAt(0) || 'P'}
                      </div>
                      {patient.firstName} {patient.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {patient.registrationNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.outreach?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        patient.gender === 'MALE'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          : 'bg-pink-500/10 text-pink-600 border-pink-500/20'
                      }
                    >
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {[patient.sector, patient.district, patient.province].filter(Boolean).join(', ')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-xl"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleOpenModal('view', patient)}
                        >
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />{' '}
                          View
                        </DropdownMenuItem>
                        <Can do="update" on="Patient">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleOpenModal('edit', patient)}
                          >
                            <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" />{' '}
                            Edit
                          </DropdownMenuItem>
                        </Can>
                        <Can do="create" on="QueueEntry">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setQueuePatientId(patient.id);
                              setQueueModalOpen(true);
                            }}
                          >
                            <ListPlus className="mr-2 h-4 w-4 text-muted-foreground" /> Add to Queue
                          </DropdownMenuItem>
                        </Can>
                        <Can do="delete" on="Patient">
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setPatientToDelete(patient);
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
              <span className="font-medium text-foreground">
                {totalNumItems}
              </span>{' '}
              patients
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0 || isLoadingPatients}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= totalNumItems || isLoadingPatients}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <PatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedPatient}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingPatient}
        title="Delete Patient"
        description={`Are you sure you want to delete the record for ${patientToDelete?.firstName} ${patientToDelete?.lastName}? This action cannot be undone.`}
      />

      <QueueEntryModal
        open={queueModalOpen}
        onOpenChange={setQueueModalOpen}
        onSuccess={() => setQueueModalOpen(false)}
        preselectedPatientId={queuePatientId}
      />
    </div>
  );
}
