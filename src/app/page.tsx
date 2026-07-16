'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useDashboard, useDeleteTrade, useTrades } from '@/hooks/useTrades';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { EquityCurveChart } from '@/components/dashboard/equity-curve-chart';
import { MonthlyPerformanceChart } from '@/components/dashboard/monthly-performance-chart';
import { WinLossPieChart } from '@/components/dashboard/win-loss-pie-chart';
import { CategoryBarChart } from '@/components/dashboard/category-bar-chart';
import { EmotionPieChart } from '@/components/dashboard/emotion-pie-chart';
import { CalendarHeatmap } from '@/components/dashboard/calendar-heatmap';
import { TradeFiltersBar } from '@/components/trades/trade-filters-bar';
import { TradeTable } from '@/components/trades/trade-table';
import { Pagination } from '@/components/trades/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { TradeDTO, TradeFilters } from '@/types/trade';
import Link from 'next/link';

const DEFAULT_FILTERS: TradeFilters = {
  sortBy: 'date',
  sortDir: 'desc',
  page: 1,
  pageSize: 10,
  outcome: 'all',
};

export default function HomePage() {
  const [filters, setFilters] = useState<TradeFilters>(DEFAULT_FILTERS);
  const [pendingDelete, setPendingDelete] = useState<TradeDTO | null>(null);

  const dashboardFilters = { from: filters.from, to: filters.to, symbol: filters.symbol, setup: filters.setup, emotion: filters.emotion };
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard(dashboardFilters);
  const { data: tradesPage, isLoading: tradesLoading } = useTrades(filters);
  const deleteTrade = useDeleteTrade();

  function updateFilters(partial: Partial<TradeFilters>) {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  }

  function handleSortChange(field: NonNullable<TradeFilters['sortBy']>) {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'desc' ? 'asc' : 'desc',
    }));
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    await deleteTrade.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const hasNoTradesAtAll = !tradesLoading && tradesPage?.total === 0 && !filters.from && !filters.symbol && !filters.setup && !filters.emotion;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your trading performance at a glance.</p>
      </div>

      {hasNoTradesAtAll ? (
        <EmptyState
          icon={<TrendingUp size={28} />}
          title="No trades logged yet"
          description="Add your first trade to start building your stats and charts."
          action={
            <Link href="/trades/new">
              <Button size="sm">Add your first trade</Button>
            </Link>
          }
        />
      ) : (
        <>
          <StatsGrid stats={dashboard?.stats} isLoading={dashboardLoading} />

          <div className="grid gap-5 lg:grid-cols-2">
            <EquityCurveChart data={dashboard?.equityCurve} isLoading={dashboardLoading} />
            <MonthlyPerformanceChart data={dashboard?.monthlyPerformance} isLoading={dashboardLoading} />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <WinLossPieChart data={dashboard?.winLossBreakdown} isLoading={dashboardLoading} />
            <CategoryBarChart title="Trades by Symbol" data={dashboard?.bySymbol} isLoading={dashboardLoading} />
            <CategoryBarChart title="Trades by Setup" data={dashboard?.bySetup} isLoading={dashboardLoading} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <EmotionPieChart data={dashboard?.byEmotion} isLoading={dashboardLoading} />
            <CalendarHeatmap data={dashboard?.calendar} isLoading={dashboardLoading} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Trade Log</h2>
            <TradeFiltersBar
              filters={filters}
              onChange={updateFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />

            {!tradesLoading && tradesPage?.total === 0 ? (
              <EmptyState title="No trades match these filters" description="Try widening your date range or clearing filters." />
            ) : (
              <>
                <TradeTable
                  trades={tradesPage?.data ?? []}
                  isLoading={tradesLoading}
                  sortBy={filters.sortBy}
                  sortDir={filters.sortDir}
                  onSortChange={handleSortChange}
                  onDeleteRequest={setPendingDelete}
                />
                {tradesPage && (
                  <Pagination
                    page={tradesPage.page}
                    totalPages={tradesPage.totalPages}
                    total={tradesPage.total}
                    onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this trade?"
        description="This action can't be undone."
        loading={deleteTrade.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
