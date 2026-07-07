'use client';

import { Label } from '@/app/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';

interface Station {
  id: string;
  name: string;
  type: string;
}

interface StationMoveSectionProps {
  stations: Station[];
  value: string;
  onChange: (id: string) => void;
  currentStationId?: string | null;
}

export function StationMoveSection({ stations, value, onChange, currentStationId }: StationMoveSectionProps) {
  const available = stations.filter((s) => s.id !== currentStationId);

  return (
    <div className="border-t pt-4 space-y-1.5">
      <Label className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
        Move to station after saving (optional)
      </Label>
      {available.length === 0 ? (
        <p className="text-sm text-muted-foreground">No other stations in this outreach.</p>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a station…" />
          </SelectTrigger>
          <SelectContent>
            {available.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {value && (
        <p className="text-xs text-muted-foreground">
          Patient will be moved to this station immediately after saving.
        </p>
      )}
    </div>
  );
}
