'use client';

import { useState } from 'react';
import { Pill, ArrowRight, AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { PrescriptionRecord } from '@/app/store/queue-entries/queue-entries.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rx: PrescriptionRecord | null;
  onConfirm: () => Promise<void>;
}

export function DispenseConfirmModal({ open, onOpenChange, rx, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  if (!rx) return null;

  const { pharmacyStock: stock } = rx;
  const projected = Math.max(0, stock.quantityInStock - rx.quantity);
  const isLow = projected <= 10;
  const isEmpty = projected === 0;

  const stockColor = isEmpty
    ? 'text-destructive font-bold'
    : isLow
    ? 'text-amber-600 font-semibold'
    : 'text-emerald-600 font-semibold';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            Confirm Dispense
          </DialogTitle>
          <DialogDescription>
            Review the prescription before dispensing medication to the patient.
          </DialogDescription>
        </DialogHeader>

        {/* Medication info */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
          <p className="font-semibold text-sm">{stock.medicationName}</p>
          <p className="text-xs text-muted-foreground">
            {stock.genericName} · {stock.strength} · {stock.dosageForm}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="text-xs">Dosage: {rx.dosage}</Badge>
            <Badge variant="secondary" className="text-xs">Qty: {rx.quantity} {stock.unitOfMeasure}</Badge>
          </div>
          {rx.instructions && (
            <p className="text-xs text-muted-foreground pt-1 italic">"{rx.instructions}"</p>
          )}
        </div>

        {/* Stock preview */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Stock after dispense</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-mono">
              {stock.quantityInStock} {stock.unitOfMeasure}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className={`font-mono ${stockColor}`}>
              {projected} {stock.unitOfMeasure}
            </span>
          </div>
          {(isEmpty || isLow) && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${isEmpty ? 'text-destructive' : 'text-amber-500'}`} />
              <p className={`text-xs font-medium ${isEmpty ? 'text-destructive' : 'text-amber-600'}`}>
                {isEmpty ? 'Stock will be depleted after this dispense.' : 'Stock will be low after this dispense.'}
              </p>
            </div>
          )}
        </div>

        {/* Prescribed by */}
        <p className="text-xs text-muted-foreground">
          Prescribed by {rx.prescribedBy.firstName} {rx.prescribedBy.lastName}
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? 'Dispensing…' : 'Confirm Dispense'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
