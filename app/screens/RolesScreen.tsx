'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchRoles, createRole, updateRole, deleteRole } from '@/app/store/roles';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { Role } from '@/app/store/roles/roles.types';
import { RoleModal } from '@/app/components/modals/RoleModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

export default function RolesScreen() {
  const dispatch = useAppDispatch();
  const { list: roles, totalNumItems, isLoadingRoles, isDeletingRole } = useAppSelector((s) => s.roles);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const loadData = () => {
    dispatch(fetchRoles({ limit, offset, search: debouncedSearch || undefined }));
  };

  useEffect(() => {
    loadData();
  }, [offset, debouncedSearch]);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', role: Role | null = null) => {
    setModalMode(mode);
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await dispatch(deleteRole(roleToDelete.id)).unwrap();
      toast.success('Role deleted successfully');
      loadData();
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createRole(values)).unwrap();
        toast.success('Role created successfully');
      } else if (modalMode === 'edit' && selectedRole) {
        await dispatch(updateRole({ id: selectedRole.id, data: values })).unwrap();
        toast.success('Role updated successfully');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} role`);
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Roles
          </h2>
          <p className="text-muted-foreground mt-1">Manage system roles and their permissions.</p>
        </div>
        <Can do="create" on="Role">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </Can>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
            className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingRoles ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Loading roles...</TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No roles found.</TableCell>
              </TableRow>
            ) : roles.map((role) => (
              <TableRow key={role.id} className="transition-colors hover:bg-muted/50 group">
                <TableCell className="font-medium font-mono text-sm">{role.name}</TableCell>
                <TableCell className="text-muted-foreground">{role.description || '—'}</TableCell>
                <TableCell>
                  <Badge variant={role.isActive !== false ? 'default' : 'secondary'} className={role.isActive !== false ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20'}>
                    {role.isActive !== false ? 'Active' : 'Inactive'}
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
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('view', role)}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                      </DropdownMenuItem>
                      <Can do="update" on="Role">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('edit', role)}>
                          <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                        </DropdownMenuItem>
                      </Can>
                      <Can do="delete" on="Role">
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => { setRoleToDelete(role); setDeleteDialogOpen(true); }}
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
              <span className="font-medium text-foreground">{totalNumItems}</span> roles
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0 || isLoadingRoles}>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setOffset(offset + limit)} disabled={offset + limit >= totalNumItems || isLoadingRoles}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <RoleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedRole}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingRole}
        title="Delete Role"
        description={`Are you sure you want to delete the "${roleToDelete?.name}" role? This action cannot be undone.`}
      />
    </div>
  );
}
