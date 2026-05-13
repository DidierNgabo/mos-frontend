'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Eye, ArrowRightLeft, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchPharmacyStocks, createPharmacyStock, updatePharmacyStock, deletePharmacyStock } from '@/app/store/pharmacy-stock';
import { fetchOutreaches } from '@/app/store/outreaches';
import { useDebounce } from '@/app/hooks/useDebounce';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { PharmacyStock } from '@/app/store/pharmacy-stock/pharmacy-stock.types';
import { PharmacyStockModal } from '@/app/components/modals/PharmacyStockModal';
import { StockTransactionModal } from '@/app/components/modals/StockTransactionModal';
import { ConfirmDeleteDialog } from '@/app/components/modals/ConfirmDeleteDialog';
import { QuickTransactionPopover } from '@/app/components/pharmacy/QuickTransactionPopover';
import { Can } from '@/app/components/auth/Can';
import { toast } from 'sonner';

const DOSAGE_FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'DROPS', 'POWDER', 'SUPPOSITORY', 'INHALER'];

type PopoverState = { id: string; type: 'DISPENSE' | 'RESTOCK' } | null;

function StockBadge({ stock }: { stock: PharmacyStock }) {
  if (stock.quantityInStock === 0) {
    return <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 border-rose-500/20">Out of stock</Badge>;
  }
  if (stock.isLowStock) {
    return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">{stock.quantityInStock} {stock.unitOfMeasure} ⚠</Badge>;
  }
  return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{stock.quantityInStock} {stock.unitOfMeasure}</Badge>;
}

export default function PharmacyStockScreen() {
  const dispatch = useAppDispatch();
  const { list: stocks, totalNumItems, isLoadingPharmacyStocks, isDeletingPharmacyStock } = useAppSelector((s) => s.pharmacyStock);
  const { list: outreaches } = useAppSelector((s) => s.outreaches);
  const { activeOutreachId } = useAppSelector((s) => s.outreachContext);

  const searchRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [outreachFilter, setOutreachFilter] = useState<string | undefined>(activeOutreachId || undefined);
  const [dosageFormFilter, setDosageFormFilter] = useState<string | undefined>(undefined);
  const [lowStockFilter, setLowStockFilter] = useState<boolean | undefined>(undefined);

  // Popover state for quick dispense/restock
  const [openPopover, setOpenPopover] = useState<PopoverState>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedStock, setSelectedStock] = useState<PharmacyStock | null>(null);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [stockForTx, setStockForTx] = useState<PharmacyStock | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<PharmacyStock | null>(null);

  useEffect(() => {
    setOutreachFilter(activeOutreachId || undefined);
    setOffset(0);
  }, [activeOutreachId]);

  // Cmd+K / Ctrl+K → focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const loadData = useCallback(() => {
    dispatch(fetchPharmacyStocks({
      limit,
      offset,
      search: debouncedSearch || undefined,
      outreachId: outreachFilter || undefined,
      dosageForm: dosageFormFilter || undefined,
      isLowStock: lowStockFilter,
    }));
  }, [dispatch, limit, offset, debouncedSearch, outreachFilter, dosageFormFilter, lowStockFilter]);

  useEffect(() => {
    dispatch(fetchOutreaches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [offset, debouncedSearch, outreachFilter, dosageFormFilter, lowStockFilter]);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', stock: PharmacyStock | null = null) => {
    setModalMode(mode);
    setSelectedStock(stock);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!stockToDelete) return;
    try {
      await dispatch(deletePharmacyStock(stockToDelete.id)).unwrap();
      toast.success('Medication removed from stock');
      loadData();
    } catch {
      toast.error('Failed to delete medication');
    } finally {
      setDeleteDialogOpen(false);
      setStockToDelete(null);
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createPharmacyStock(values)).unwrap();
        toast.success('Medication added to stock');
      } else if (modalMode === 'edit' && selectedStock) {
        await dispatch(updatePharmacyStock({ id: selectedStock.id, data: values })).unwrap();
        toast.success('Medication updated successfully');
      }
      loadData();
    } catch (err: any) {
      toast.error(err || `Failed to ${modalMode} medication`);
      throw err;
    }
  };

  // Keyboard row navigation handler
  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, stock: PharmacyStock) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
    } else if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setOpenPopover({ id: stock.id, type: 'DISPENSE' });
    } else if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setOpenPopover({ id: stock.id, type: 'RESTOCK' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Pharmacy Stock
          </h2>
          <p className="text-muted-foreground mt-1">Track and manage medication inventory across outreaches.</p>
        </div>
        <Can do="create" on="PharmacyStock">
          <Button
            onClick={() => handleOpenModal('create')}
            className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        {/* Search with ⌘K hint */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
            className="pl-9 pr-14 h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <div className="w-full sm:max-w-[180px]">
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

        <div className="w-full sm:max-w-[160px]">
          <Select onValueChange={(v) => { setOffset(0); setDosageFormFilter(v === 'all' ? undefined : v); }}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="All Forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {DOSAGE_FORMS.map((f) => (
                <SelectItem key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:max-w-[160px]">
          <Select onValueChange={(v) => { setOffset(0); setLowStockFilter(v === 'all' ? undefined : v === 'low'); }}>
            <SelectTrigger className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-muted-foreground px-1">
        <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 text-[10px] font-medium">d</kbd> Dispense &nbsp;·&nbsp;
        <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 text-[10px] font-medium">r</kbd> Restock &nbsp;·&nbsp;
        <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 text-[10px] font-medium">↑↓</kbd> Navigate rows
      </p>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Medication</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Generic Name</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Form / Strength</TableHead>
                <TableHead className="font-semibold">Stock</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Outreach</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Expiry</TableHead>
                <TableHead className="font-semibold text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPharmacyStocks ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Loading pharmacy stock...</TableCell>
                </TableRow>
              ) : stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No medications found.</TableCell>
                </TableRow>
              ) : stocks.map((stock) => (
                <TableRow
                  key={stock.id}
                  tabIndex={0}
                  onKeyDown={(e) => handleRowKeyDown(e, stock)}
                  className="transition-colors hover:bg-muted/50 focus:outline-none focus:bg-muted/60 focus:ring-2 focus:ring-inset focus:ring-primary/30"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium leading-tight">{stock.medicationName}</p>
                      {stock.category && <p className="text-xs text-muted-foreground mt-0.5">{stock.category}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{stock.genericName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      <p>{stock.dosageForm.charAt(0) + stock.dosageForm.slice(1).toLowerCase()}</p>
                      <p className="text-muted-foreground text-xs">{stock.strength}</p>
                    </div>
                  </TableCell>
                  <TableCell><StockBadge stock={stock} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                    {stock.outreach?.name || '—'}
                  </TableCell>
                  <TableCell className="text-sm hidden lg:table-cell">
                    {stock.expiryDate ? (
                      <span className={new Date(stock.expiryDate) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {new Date(stock.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Action column: [-] [+] [...] */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Can do="update" on="PharmacyStock">
                        {/* Quick Dispense */}
                        <QuickTransactionPopover
                          stock={stock}
                          defaultType="DISPENSE"
                          open={openPopover?.id === stock.id && openPopover?.type === 'DISPENSE'}
                          onOpenChange={(o) => setOpenPopover(o ? { id: stock.id, type: 'DISPENSE' } : null)}
                          onSuccess={loadData}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Dispense (d)"
                              className="h-8 w-8 p-0 rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />

                        {/* Quick Restock */}
                        <QuickTransactionPopover
                          stock={stock}
                          defaultType="RESTOCK"
                          open={openPopover?.id === stock.id && openPopover?.type === 'RESTOCK'}
                          onOpenChange={(o) => setOpenPopover(o ? { id: stock.id, type: 'RESTOCK' } : null)}
                          onSuccess={loadData}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Restock (r)"
                              className="h-8 w-8 p-0 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                      </Can>

                      {/* ⋯ menu for view / edit / advanced tx / delete */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <span className="sr-only">More actions</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('view', stock)}>
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                          </DropdownMenuItem>
                          <Can do="update" on="PharmacyStock">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenModal('edit', stock)}>
                              <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => { setStockForTx(stock); setTxModalOpen(true); }}
                            >
                              <ArrowRightLeft className="mr-2 h-4 w-4 text-muted-foreground" /> Advanced Transaction
                            </DropdownMenuItem>
                          </Can>
                          <Can do="delete" on="PharmacyStock">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => { setStockToDelete(stock); setDeleteDialogOpen(true); }}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </Can>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalNumItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{offset + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(offset + limit, totalNumItems)}</span> of{' '}
              <span className="font-medium text-foreground">{totalNumItems}</span> medications
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0 || isLoadingPharmacyStocks}>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setOffset(offset + limit)} disabled={offset + limit >= totalNumItems || isLoadingPharmacyStocks}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <PharmacyStockModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={selectedStock}
        onSubmit={handleModalSubmit}
      />

      {stockForTx && (
        <StockTransactionModal
          open={txModalOpen}
          onOpenChange={setTxModalOpen}
          stock={stockForTx}
          onSuccess={loadData}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingPharmacyStock}
        title="Remove Medication"
        description={`Are you sure you want to remove "${stockToDelete?.medicationName}" from stock? This action cannot be undone.`}
      />
    </div>
  );
}
