'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';

const COLORS = ['hsl(var(--success))', 'hsl(var(--danger))'];

export function WinLossPieChart({
  data,
  isLoading,
}: {
  data?: { name: string; value: number }[];
  isLoading: boolean;
}) {
  const total = data?.reduce((sum, d) => sum + d.value, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win vs Loss</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !total ? (
        <EmptyState title="No trades yet" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {data!.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
