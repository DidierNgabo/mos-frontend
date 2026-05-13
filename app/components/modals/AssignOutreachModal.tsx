'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { fetchOutreaches, addOutreachMember } from '@/app/store/outreaches';
import { updateUser } from '@/app/store/users';
import { StationsSource } from '@/app/source';
import { User } from '@/app/store/users/users.types';
import { Station } from '@/app/store/stations/stations.types';

interface AssignOutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function AssignOutreachModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: AssignOutreachModalProps) {
  const dispatch = useAppDispatch();
  const { list: outreaches, isLoadingOutreaches } = useAppSelector(
    (state) => state.outreaches,
  );

  const [selectedOutreachId, setSelectedOutreachId] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchOutreaches({ limit: 100 }));
      setSelectedOutreachId('');
      setSelectedStationId('');
      setStations([]);
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!selectedOutreachId) {
      setStations([]);
      setSelectedStationId('');
      return;
    }

    setIsLoadingStations(true);
    setSelectedStationId('');
    StationsSource.fetchStationsRequest({ outreachId: selectedOutreachId, limit: 100 })
      .then((res: any) => setStations(res?.items ?? []))
      .catch(() => toast.error('Failed to load stations'))
      .finally(() => setIsLoadingStations(false));
  }, [selectedOutreachId]);

  const handleSubmit = async () => {
    if (!selectedOutreachId) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        addOutreachMember({ outreachId: selectedOutreachId, userIds: [user.id] }),
      ).unwrap();
      if (selectedStationId) {
        await dispatch(
          updateUser({ id: user.id, data: { stationId: selectedStationId } }),
        ).unwrap();
      }
      toast.success(`${user.firstName} ${user.lastName} assigned successfully.`);
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error('Assignment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = (user.firstName?.charAt(0) ?? 'U').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Assign Outreach
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select an outreach and a station for this user.
          </DialogDescription>
        </DialogHeader>

        {/* User info card */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border/50 px-4 py-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-secondary to-primary/30 flex items-center justify-center text-primary font-bold text-sm shadow-inner shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Outreach select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Outreach
            </Label>
            <select
              value={selectedOutreachId}
              onChange={(e) => setSelectedOutreachId(e.target.value)}
              disabled={isLoadingOutreaches}
              className="w-full h-10 rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              <option value="">
                {isLoadingOutreaches ? 'Loading outreaches…' : 'Select an outreach…'}
              </option>
              {outreaches.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Station select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Station
            </Label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              disabled={!selectedOutreachId || isLoadingStations}
              className="w-full h-10 rounded-xl border border-border bg-white/50 dark:bg-black/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              <option value="">
                {!selectedOutreachId
                  ? 'Select an outreach first'
                  : isLoadingStations
                  ? 'Loading stations…'
                  : stations.length === 0
                  ? 'No stations available'
                  : 'Select a station…'}
              </option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedOutreachId || isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          >
            {isSubmitting ? 'Assigning…' : 'Assign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
