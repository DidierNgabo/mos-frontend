'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { PharmacyStock } from '@/app/store/pharmacy-stock/pharmacy-stock.types';
import { toast } from 'sonner';
import { PharmacyStockSource } from '@/app/source';

type TransactionType = 'RESTOCK' | 'DISPENSE' | 'ADJUSTMENT' | 'EXPIRY_REMOVAL' | 'RETURN';

const INCREASE_TYPES = new Set<TransactionType>(['RESTOCK', 'RETURN']);

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'RESTOCK', label: 'Restock (add)' },
  { value: 'DISPENSE', label: 'Dispense (remove)' },
  { value: 'ADJUSTMENT', label: 'Adjustment (remove)' },
  { value: 'EXPIRY_REMOVAL', label: 'Remove Expired (remove)' },
  { value: 'RETURN', label: 'Return (add)' },
];

interface StockTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: PharmacyStock;
  onSuccess: () => void;
}

export function StockTransactionModal({ open, onOpenChange, stock, onSuccess }: StockTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('ADJUSTMENT');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qty = typeof quantity === 'number' ? quantity : 0;
  const projected = INCREASE_TYPES.has(transactionType)
    ? stock.quantityInStock + qty
    : Math.max(0, stock.quantityInStock - qty);

  const handleClose = () => {
    setTransactionType('ADJUSTMENT');
    setQuantity('');
    setNotes('');
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!qty || qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    setIsSubmitting(true);
    try {
      await PharmacyStockSource.recordStockTransactionRequest(stock.id, {
        transactionType,
        quantity: qty,
        notes: notes.trim() || undefined,
      });
      toast.success('Transaction recorded successfully');
      onSuccess();
      handleClose();
    } catch {
      toast.error('Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold tracking-tight">Advanced Transaction</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {stock.medicationName} — {stock.strength} ({stock.dosageForm.toLowerCase()})
          </DialogDescription>
          <p className="text-xs text-muted-foreground mt-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/40">
            For quick dispense or restock, use the <strong>−</strong> / <strong>+</strong> buttons on the table row.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Transaction Type</Label>
            <Select value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
              <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-black/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="txQty" className="text-sm font-semibold text-foreground/80">Quantity</Label>
            <Input
              id="txQty"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
              className="h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl"
              placeholder="Enter quantity..."
            />
          </div>

          {/* Live preview */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock Preview</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-foreground">{stock.quantityInStock} {stock.unitOfMeasure}</span>
              <span className="text-muted-foreground">→</span>
              <span className={`font-bold ${projected === 0 ? 'text-destructive' : projected <= stock.lowStockThreshold ? 'text-amber-600' : 'text-emerald-600'}`}>
                {projected} {stock.unitOfMeasure}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="txNotes" className="text-sm font-semibold text-foreground/80">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <textarea
              id="txNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this transaction..."
              className="w-full rounded-xl bg-white/50 dark:bg-black/50 border border-border p-3 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} className="h-12 px-6 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !quantity || qty <= 0}
              className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              {isSubmitting ? 'Recording...' : 'Record'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
