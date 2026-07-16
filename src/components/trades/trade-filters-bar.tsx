'use client';

import { EMOTIONS, SETUPS, SYMBOLS, TradeFilters } from '@/types/trade';
import { Input, Select } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TradeFiltersBarProps {
  filters: TradeFilters;
  onChange: (filters: Partial<TradeFilters>) => void;
  onReset: () => void;
}

export function TradeFiltersBar({ filters, onChange, onReset }: TradeFiltersBarProps) {
  const hasActiveFilters =
    filters.from || filters.to || filters.symbol || filters.setup || filters.emotion || (filters.outcome && filters.outcome !== 'all');

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">From</label>
        <Input
          type="date"
          className="h-9 w-36"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="date"
          className="h-9 w-36"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Symbol</label>
        <Select
          className="h-9 w-36"
          value={filters.symbol ?? ''}
          onChange={(e) => onChange({ symbol: e.target.value || undefined })}
        >
          <option value="">All symbols</option>
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Setup</label>
        <Select
          className="h-9 w-40"
          value={filters.setup ?? ''}
          onChange={(e) => onChange({ setup: e.target.value || undefined })}
        >
          <option value="">All setups</option>
          {SETUPS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Emotion</label>
        <Select
          className="h-9 w-36"
          value={filters.emotion ?? ''}
          onChange={(e) => onChange({ emotion: e.target.value || undefined })}
        >
          <option value="">All emotions</option>
          {EMOTIONS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Outcome</label>
        <Select
          className="h-9 w-32"
          value={filters.outcome ?? 'all'}
          onChange={(e) => onChange({ outcome: e.target.value as TradeFilters['outcome'] })}
        >
          <option value="all">All</option>
          <option value="win">Wins only</option>
          <option value="loss">Losses only</option>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X size={13} />
          Clear filters
        </Button>
      )}
    </div>
  );
}
