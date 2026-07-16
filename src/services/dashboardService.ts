import { tradeRepository } from '@/repositories/tradeRepository';
import { ITrade } from '@/models/Trade';
import {
  CalendarDay,
  CategoryBreakdown,
  DashboardResponse,
  DashboardStats,
  EquityPoint,
  MonthlyPoint,
  TradeFiltersInput,
} from '@/types/trade';

type LeanTrade = ITrade & { _id: unknown };

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function computeStats(trades: LeanTrade[]): DashboardStats {
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result > 0);
  const losses = trades.filter((t) => t.result < 0);

  const grossProfit = wins.reduce((sum, t) => sum + t.result, 0);
  const grossLoss = losses.reduce((sum, t) => sum + t.result, 0); // negative
  const netProfit = grossProfit + grossLoss;

  const averageWin = wins.length ? grossProfit / wins.length : 0;
  const averageLoss = losses.length ? grossLoss / losses.length : 0;

  const largestWin = wins.length ? Math.max(...wins.map((t) => t.result)) : 0;
  const largestLoss = losses.length ? Math.min(...losses.map((t) => t.result)) : 0;

  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const lossRate = totalTrades ? (losses.length / totalTrades) * 100 : 0;

  const profitFactor = grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : null;

  // Expectancy = (winRate * avgWin) + (lossRate * avgLoss), rates as fractions
  const expectancy = totalTrades
    ? (wins.length / totalTrades) * averageWin + (losses.length / totalTrades) * averageLoss
    : 0;

  const averageTrade = totalTrades ? netProfit / totalTrades : 0;

  // Streaks — trades are expected to arrive sorted by date ascending.
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  let currentStreakCount = 0;
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let runningWin = 0;
  let runningLoss = 0;

  for (const t of trades) {
    if (t.result > 0) {
      runningWin += 1;
      runningLoss = 0;
      bestWinStreak = Math.max(bestWinStreak, runningWin);
    } else {
      runningLoss += 1;
      runningWin = 0;
      worstLossStreak = Math.max(worstLossStreak, runningLoss);
    }
  }
  if (trades.length) {
    const last = trades[trades.length - 1];
    currentStreakType = last.result > 0 ? 'win' : 'loss';
    currentStreakCount = currentStreakType === 'win' ? runningWin : runningLoss;
  }

  return {
    totalTrades,
    wins: wins.length,
    losses: losses.length,
    winRate: round2(winRate),
    lossRate: round2(lossRate),
    netProfit: round2(netProfit),
    grossProfit: round2(grossProfit),
    grossLoss: round2(grossLoss),
    averageWin: round2(averageWin),
    averageLoss: round2(averageLoss),
    largestWin: round2(largestWin),
    largestLoss: round2(largestLoss),
    profitFactor: profitFactor !== null ? round2(profitFactor) : null,
    expectancy: round2(expectancy),
    averageTrade: round2(averageTrade),
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    bestWinStreak,
    worstLossStreak,
  };
}

function computeEquityCurve(trades: LeanTrade[]): EquityPoint[] {
  let cumulative = 0;
  return trades.map((t) => {
    cumulative += t.result;
    return {
      date: new Date(t.date).toISOString(),
      cumulative: round2(cumulative),
      result: round2(t.result),
    };
  });
}

function computeMonthlyPerformance(trades: LeanTrade[]): MonthlyPoint[] {
  const map = new Map<string, number>();
  for (const t of trades) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + t.result);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, profit]) => ({ month, profit: round2(profit) }));
}

function computeBreakdown(trades: LeanTrade[], field: 'symbol' | 'setup' | 'emotion'): CategoryBreakdown[] {
  const map = new Map<string, { count: number; netResult: number }>();
  for (const t of trades) {
    const key = t[field] as string;
    const existing = map.get(key) ?? { count: 0, netResult: 0 };
    existing.count += 1;
    existing.netResult += t.result;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, count: v.count, netResult: round2(v.netResult) }))
    .sort((a, b) => b.count - a.count);
}

function computeCalendar(trades: LeanTrade[]): CalendarDay[] {
  const map = new Map<string, { netResult: number; trades: number }>();
  for (const t of trades) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    const existing = map.get(key) ?? { netResult: 0, trades: 0 };
    existing.netResult += t.result;
    existing.trades += 1;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .map(([date, v]) => ({ date, netResult: round2(v.netResult), trades: v.trades }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const dashboardService = {
  async getDashboard(userId: string, filters: Partial<TradeFiltersInput> = {}): Promise<DashboardResponse> {
    const trades = (await tradeRepository.findAllForStats(userId, filters)) as unknown as LeanTrade[];

    const stats = computeStats(trades);
    const equityCurve = computeEquityCurve(trades);
    const monthlyPerformance = computeMonthlyPerformance(trades);
    const winLossBreakdown: { name: 'Wins' | 'Losses'; value: number }[] = [
      { name: 'Wins', value: stats.wins },
      { name: 'Losses', value: stats.losses },
    ];
    const bySymbol = computeBreakdown(trades, 'symbol');
    const bySetup = computeBreakdown(trades, 'setup');
    const byEmotion = computeBreakdown(trades, 'emotion');
    const calendar = computeCalendar(trades);

    return {
      stats,
      equityCurve,
      monthlyPerformance,
      winLossBreakdown,
      bySymbol,
      bySetup,
      byEmotion,
      calendar,
    };
  },
};
