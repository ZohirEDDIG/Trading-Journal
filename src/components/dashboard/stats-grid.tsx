import { DashboardStats } from '@/types/trade';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { formatCurrency, formatPercent, formatSignedCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

interface StatDefinition {
  label: string;
  value: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

function buildStats(stats: DashboardStats): StatDefinition[] {
  const streakLabel =
    stats.currentStreak.type === 'none'
      ? '—'
      : `${stats.currentStreak.count} ${stats.currentStreak.type === 'win' ? 'win' : 'loss'}${
          stats.currentStreak.count === 1 ? '' : 'es'
        }`;

  return [
    { label: 'Total Trades', value: String(stats.totalTrades) },
    { label: 'Wins', value: String(stats.wins), tone: 'positive' },
    { label: 'Losses', value: String(stats.losses), tone: 'negative' },
    { label: 'Win Rate', value: formatPercent(stats.winRate) },
    { label: 'Loss Rate', value: formatPercent(stats.lossRate) },
    {
      label: 'Net Profit',
      value: formatSignedCurrency(stats.netProfit),
      tone: stats.netProfit >= 0 ? 'positive' : 'negative',
    },
    { label: 'Gross Profit', value: formatCurrency(stats.grossProfit), tone: 'positive' },
    { label: 'Gross Loss', value: formatCurrency(stats.grossLoss), tone: 'negative' },
    { label: 'Average Win', value: formatCurrency(stats.averageWin), tone: 'positive' },
    { label: 'Average Loss', value: formatCurrency(stats.averageLoss), tone: 'negative' },
    { label: 'Largest Win', value: formatCurrency(stats.largestWin), tone: 'positive' },
    { label: 'Largest Loss', value: formatCurrency(stats.largestLoss), tone: 'negative' },
    { label: 'Profit Factor', value: stats.profitFactor === null ? '∞' : stats.profitFactor.toFixed(2) },
    {
      label: 'Expectancy',
      value: formatSignedCurrency(stats.expectancy),
      tone: stats.expectancy >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Average Trade',
      value: formatSignedCurrency(stats.averageTrade),
      tone: stats.averageTrade >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Current Streak',
      value: streakLabel,
      tone: stats.currentStreak.type === 'win' ? 'positive' : stats.currentStreak.type === 'loss' ? 'negative' : 'neutral',
    },
    { label: 'Best Win Streak', value: String(stats.bestWinStreak), tone: 'positive' },
    { label: 'Worst Loss Streak', value: String(stats.worstLossStreak), tone: 'negative' },
  ];
}

const toneClasses: Record<NonNullable<StatDefinition['tone']>, string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-foreground',
};

export function StatsGrid({ stats, isLoading }: { stats?: DashboardStats; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const items = buildStats(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className={cn('mt-1.5 font-mono text-lg font-semibold', toneClasses[item.tone ?? 'neutral'])}>
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
