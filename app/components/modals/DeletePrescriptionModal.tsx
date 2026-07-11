'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { PrescriptionRecord } from '@/app/store/queue-entries/queue-entries.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rx: PrescriptionRecord | null;
  onConfirm: () => Promise<void>;
}

export function DeletePrescriptionModal({ open, onOpenChange, rx, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  if (!rx) return null;

  const medicationName = rx.pharmacyStock?.medicationName ?? rx.customMedicationName ?? 'this medication';

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
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Remove Prescription
          </DialogTitle>
          <DialogDescription>
            This will permanently delete the prescription from this patient&apos;s record.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-1">
          <p className="font-semibold text-sm">{medicationName}</p>
          {rx.pharmacyStock && (
            <p className="text-xs text-muted-foreground">
              {rx.pharmacyStock.genericName} · {rx.pharmacyStock.strength}
            </p>
          )}
          <p className="text-xs text-muted-foreground pt-0.5">
            Dosage: {rx.dosage} · Qty: {rx.quantity}
          </p>
          <p className="text-xs text-muted-foreground">
            Prescribed by {rx.prescribedBy.firstName} {rx.prescribedBy.lastName}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove <span className="font-semibold text-foreground">{medicationName}</span> from this patient&apos;s prescriptions? This cannot be undone.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? 'Removing…' : 'Remove Prescription'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
