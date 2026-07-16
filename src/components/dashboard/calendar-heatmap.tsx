'use client';

import { useMemo, useState } from 'react';
import { CalendarDay } from '@/types/trade';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';
import { formatDate, formatSignedCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

function intensityClass(netResult: number, maxAbs: number): string {
  if (netResult === 0 || maxAbs === 0) return 'bg-muted';
  const ratio = Math.min(Math.abs(netResult) / maxAbs, 1);
  const bucket = ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1;
  if (netResult > 0) {
    return ['', 'bg-success/20', 'bg-success/40', 'bg-success/65', 'bg-success'][bucket];
  }
  return ['', 'bg-danger/20', 'bg-danger/40', 'bg-danger/65', 'bg-danger'][bucket];
}

export function CalendarHeatmap({ data, isLoading }: { data?: CalendarDay[]; isLoading: boolean }) {
  const [hovered, setHovered] = useState<CalendarDay | null>(null);

  const { weeks, maxAbs } = useMemo(() => {
    if (!data?.length) return { weeks: [] as (CalendarDay | null)[][], maxAbs: 0 };

    const byDate = new Map(data.map((d) => [d.date, d]));
    const last = new Date(data[data.length - 1].date);
    const start = new Date(last);
    start.setDate(start.getDate() - 6 * 7 - start.getDay());

    const days: (CalendarDay | null)[] = [];
    const cursor = new Date(start);
    while (cursor <= last) {
      const key = cursor.toISOString().slice(0, 10);
      days.push(byDate.get(key) ?? { date: key, netResult: 0, trades: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeks: (CalendarDay | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const maxAbs = Math.max(...data.map((d) => Math.abs(d.netResult)), 1);
    return { weeks, maxAbs };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily P/L Calendar</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !data?.length ? (
        <EmptyState title="No trades yet" description="Your last ~12 weeks of activity will show up here." />
      ) : (
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={di}
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        'h-3.5 w-3.5 rounded-[3px] transition-transform hover:scale-125',
                        intensityClass(day.netResult, maxAbs)
                      )}
                    />
                  ) : (
                    <div key={di} className="h-3.5 w-3.5" />
                  )
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {hovered
                ? `${formatDate(hovered.date)} · ${hovered.trades} trade${hovered.trades === 1 ? '' : 's'} · ${formatSignedCurrency(hovered.netResult)}`
                : 'Hover a day for details'}
            </span>
            <div className="flex items-center gap-1">
              <span>Loss</span>
              <div className="h-3 w-3 rounded-[3px] bg-danger" />
              <div className="h-3 w-3 rounded-[3px] bg-danger/40" />
              <div className="h-3 w-3 rounded-[3px] bg-muted" />
              <div className="h-3 w-3 rounded-[3px] bg-success/40" />
              <div className="h-3 w-3 rounded-[3px] bg-success" />
              <span>Profit</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
