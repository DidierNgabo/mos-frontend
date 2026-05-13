'use client';

import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { PharmacyStock } from '@/app/store/pharmacy-stock/pharmacy-stock.types';
import { PharmacyStockSource } from '@/app/source';
import { toast } from 'sonner';

type QuickType = 'DISPENSE' | 'RESTOCK';

const INCREASE_TYPES = new Set<QuickType>(['RESTOCK']);
const PRESETS = [5, 10, 20, 30, 50];

interface QuickTransactionPopoverProps {
  stock: PharmacyStock;
  defaultType: QuickType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

export function QuickTransactionPopover({
  stock,
  defaultType,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: QuickTransactionPopoverProps) {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const qty = typeof quantity === 'number' ? quantity : 0;
  const projected = INCREASE_TYPES.has(defaultType)
    ? stock.quantityInStock + qty
    : Math.max(0, stock.quantityInStock - qty);

  const isDispense = defaultType === 'DISPENSE';
  const previewColor =
    projected === 0
      ? 'text-destructive font-bold'
      : projected <= stock.lowStockThreshold
      ? 'text-amber-600 font-semibold'
      : 'text-emerald-600 font-semibold';

  useEffect(() => {
    if (open) {
      setQuantity('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleClose = () => {
    setQuantity('');
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (qty <= 0) {
      toast.error('Enter a quantity greater than 0');
      inputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      await PharmacyStockSource.recordStockTransactionRequest(stock.id, {
        transactionType: defaultType,
        quantity: qty,
      });
      const verb = isDispense ? 'dispensed' : 'restocked';
      toast.success(`${qty} ${stock.unitOfMeasure} of ${stock.medicationName} ${verb}`);
      onSuccess();
      handleClose();
    } catch {
      toast.error(`Failed to ${isDispense ? 'dispense' : 'restock'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
    if (e.key === 'Escape') { e.preventDefault(); handleClose(); }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-4"
        align="end"
        side="left"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isDispense ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
            {isDispense
              ? <Minus className="h-3.5 w-3.5 text-rose-600" />
              : <Plus className="h-3.5 w-3.5 text-emerald-600" />
            }
          </div>
          <div>
            <p className={`text-sm font-bold ${isDispense ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isDispense ? 'Dispense' : 'Restock'}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {stock.medicationName} · {stock.quantityInStock} {stock.unitOfMeasure}
            </p>
          </div>
        </div>

        {/* Preset pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setQuantity(p); inputRef.current?.focus(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors
                ${quantity === p
                  ? isDispense
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-700'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700'
                  : 'bg-muted/60 border-border/50 text-muted-foreground hover:bg-muted'
                }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Quantity input */}
        <div className="mb-3">
          <Input
            ref={inputRef}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
            placeholder="Enter quantity..."
            className="h-10 rounded-xl bg-white/50 dark:bg-black/50 border-border text-center text-lg font-semibold"
          />
        </div>

        {/* Live preview */}
        {qty > 0 && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{stock.quantityInStock} {stock.unitOfMeasure}</span>
            <span className="text-muted-foreground mx-2">→</span>
            <span className={previewColor}>{projected} {stock.unitOfMeasure}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl h-9"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || qty <= 0}
            onClick={handleSubmit}
            className={`flex-1 rounded-xl h-9 font-semibold ${
              isDispense
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
            }`}
          >
            {isSubmitting ? '...' : isDispense ? 'Dispense' : 'Restock'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">Enter to confirm · Esc to cancel</p>
      </PopoverContent>
    </Popover>
  );
}
