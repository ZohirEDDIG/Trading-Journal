'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthlyPoint } from '@/types/trade';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';
import { formatMonth, formatSignedCurrency } from '@/utils/format';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-soft-lg">
      <p className="text-muted-foreground">{formatMonth(label)}</p>
      <p className={value >= 0 ? 'font-mono font-medium text-success' : 'font-mono font-medium text-danger'}>
        {formatSignedCurrency(value)}
      </p>
    </div>
  );
}

export function MonthlyPerformanceChart({ data, isLoading }: { data?: MonthlyPoint[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.length ? (
        <EmptyState title="No data yet" description="Monthly totals will appear once you log trades." />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(v) => formatMonth(v)}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatSignedCurrency(v)}
              width={70}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
