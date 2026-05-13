import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
}: MultiSelectProps) {
  const handleSelectChange = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedLabels = selected
    .map((value) => options.find((opt) => opt.value === value)?.label)
    .filter(Boolean);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            'w-full justify-between h-12 bg-white/50 dark:bg-black/50 border-border rounded-xl font-normal hover:bg-white/80 dark:hover:bg-black/80',
            !selected.length && 'text-muted-foreground'
          )}
        >
          <div className="truncate pr-4">
            {selectedLabels.length > 0
              ? selectedLabels.join(', ')
              : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] rounded-xl">
        {options.length > 0 && (
          <div className="flex justify-between items-center px-3 py-2 border-b border-border/50">
            <button
              type="button"
              onClick={() => onChange(options.map((o) => o.value))}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
        <div className="max-h-52 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleSelectChange(option.value)}
              className="rounded-lg py-2 cursor-pointer"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          {options.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground text-center">No options found.</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
