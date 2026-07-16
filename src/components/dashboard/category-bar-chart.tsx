'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CategoryBreakdown } from '@/types/trade';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';
import { formatSignedCurrency } from '@/utils/format';

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as CategoryBreakdown;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-soft-lg">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{item.count} trades</p>
      <p className={item.netResult >= 0 ? 'font-mono text-success' : 'font-mono text-danger'}>
        {formatSignedCurrency(item.netResult)}
      </p>
    </div>
  );
}

export function CategoryBarChart({
  title,
  data,
  isLoading,
  metric = 'count',
}: {
  title: string;
  data?: CategoryBreakdown[];
  isLoading: boolean;
  metric?: 'count' | 'netResult';
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.length ? (
        <EmptyState title="No data yet" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey={metric} radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    metric === 'netResult'
                      ? entry.netResult >= 0
                        ? 'hsl(var(--success))'
                        : 'hsl(var(--danger))'
                      : 'hsl(var(--accent))'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
