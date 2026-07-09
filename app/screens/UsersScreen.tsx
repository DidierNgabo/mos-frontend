'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Eye, MapPin } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '@/app/store/users';
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
import { User } from '@/app/store/users/users.types';
import { UserModal } from '@/app/components/modals/UserModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { AssignOutreachModal } from '@/app/components/modals/AssignOutreachModal';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

export default function UsersScreen() {
  const dispatch = useAppDispatch();
  const { list: users, totalNumItems, isLoadingUsers, isDeletingUser } = useAppSelector((state) => state.users);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Pagination and Filters state
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [statusFilterValue, setStatusFilterValue] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Assign Outreach Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<User | null>(null);

  const loadData = () => {
    dispatch(fetchUsers({
      limit,
      offset,
      search: debouncedSearch || undefined,
      isActive: isActiveFilter,
      outreachId: activeOutreachId || undefined,
    }));
  };

  useEffect(() => {
    setOffset(0);
  }, [activeOutreachId]);

  useEffect(() => {
    loadData();
  }, [dispatch, offset, debouncedSearch, isActiveFilter, activeOutreachId]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleFilterChange = (val: string) => {
    setOffset(0);
    setStatusFilterValue(val);
    setIsActiveFilter(val === 'all' ? undefined : val === 'true');
  };

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', user: User | null = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      toast.success('User deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createUser(values)).unwrap();
        toast.success('User created successfully. An email has been sent.');
      } else if (modalMode === 'edit' && selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, data: values })).unwrap();
        toast.success('User updated successfully.');
      }
      loadData();
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Users
          </h2>
          <p className="text-muted-foreground mt-1">Manage system users, roles, and access.</p>
        </div>
        <Can do="create" on="User">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New User
          </Button>
        </Can>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOffset(0);
            }}
            className="pl-9 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
        </div>
        <div className="w-full sm:max-w-[150px]">
          <Select value={statusFilterValue} onValueChange={handleFilterChange}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
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
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Roles</TableHead>
              <TableHead className="font-semibold">Station</TableHead>
              <TableHead className="font-semibold">Outreach</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles?.map((role: any) => (
                        <Badge key={role.id || role.name || role} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-normal">
                          {role.name || role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.station?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.outreaches && user.outreaches.length > 0
                        ? user.outreaches.map((o) => (
                            <Badge key={o.id} variant="secondary" className="bg-secondary/50 text-xs font-normal">
                              {o.name}
                            </Badge>
                          ))
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20'}>
                      {user.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('view', user)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                        </DropdownMenuItem>
                        <Can do="update" on="User">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('edit', user)}>
                            <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                          </DropdownMenuItem>
                        </Can>
                        <Can do="update" on="User">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => { setUserToAssign(user); setAssignModalOpen(true); }}
                          >
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> Assign Outreach
                          </DropdownMenuItem>
                        </Can>
                        <Can do="delete" on="User">
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setUserToDelete(user);
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
              Showing <span className="font-medium text-foreground">{offset + 1}</span> to <span className="font-medium text-foreground">{Math.min(offset + limit, totalNumItems)}</span> of <span className="font-medium text-foreground">{totalNumItems}</span> users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => handlePageChange(Math.max(0, offset - limit))}
                disabled={offset === 0 || isLoadingUsers}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9"
                onClick={() => handlePageChange(offset + limit)}
                disabled={offset + limit >= totalNumItems || isLoadingUsers}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedUser}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingUser}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
      />

      {userToAssign && (
        <AssignOutreachModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          user={userToAssign}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
