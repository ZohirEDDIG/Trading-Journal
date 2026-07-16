'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryBreakdown } from '@/types/trade';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';

// A varied but muted palette so no single slice reads as "win" or "loss" —
// this chart is about pattern recognition, not P/L, so it stays separate
// from the success/danger semantic colors used elsewhere.
const PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#f97316',
  '#3b82f6',
];

export function EmotionPieChart({ data, isLoading }: { data?: CategoryBreakdown[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Analysis</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.length ? (
        <EmptyState title="No data yet" description="Log how you felt on each trade to spot emotional patterns." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" outerRadius={90} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
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
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}
              layout="horizontal"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
