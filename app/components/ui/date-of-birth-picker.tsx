'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i);

interface DateOfBirthPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

function parseParts(v: string) {
  const p = v ? v.split('-') : [];
  return {
    year:  p[0] ?? '',
    month: p[1] ? String(Number(p[1])) : '',
    day:   p[2] ? String(Number(p[2])) : '',
  };
}

export function DateOfBirthPicker({ value, onChange, disabled, className }: DateOfBirthPickerProps) {
  const init = parseParts(value);
  const [year,  setYear]  = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [day,   setDay]   = useState(init.day);

  // Sync internal state when the value prop changes from outside
  // (initial load, editing an existing patient, or form reset).
  // We skip the sync when value is '' AND the internal state already represents
  // a partial selection — that case is handled locally and should not reset the dropdowns.
  useEffect(() => {
    const parsed = parseParts(value);
    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
  }, [value]);

  function emit(d: string, m: string, y: string) {
    if (d && m && y) {
      // All three parts present — emit a valid ISO date string.
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    }
    // Partial selection: do NOT call onChange at all. Formik retains its
    // current value ('' for a new form), which correctly triggers the
    // "required" validation error on submit until all three parts are chosen.
  }

  const triggerCls = `h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl flex-1 ${className ?? ''}`;

  return (
    <div className="flex gap-2">
      <Select
        value={day}
        onValueChange={(v) => { setDay(v); emit(v, month, year); }}
        disabled={disabled}
      >
        <SelectTrigger className={triggerCls}>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {String(d).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month}
        onValueChange={(v) => { setMonth(v); emit(day, v, year); }}
        disabled={disabled}
      >
        <SelectTrigger className={triggerCls}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, i) => (
            <SelectItem key={i} value={String(i + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year}
        onValueChange={(v) => { setYear(v); emit(day, month, v); }}
        disabled={disabled}
      >
        <SelectTrigger className={triggerCls}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
