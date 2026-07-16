export const SYMBOLS = [
  'Gold',
  'Silver',
  'Bitcoin',
  'Ethereum',
  'NASDAQ',
  'S&P 500',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'Other',
] as const;

export const SETUPS = [
  'Breakout',
  'Pullback',
  'Liquidity Sweep',
  'Support & Resistance',
  'Order Block',
  'Fair Value Gap',
  'Trend Continuation',
  'Reversal',
  'Other',
] as const;

export const EMOTIONS = [
  'Calm',
  'Confident',
  'Focused',
  'Hesitant',
  'Fearful',
  'Greedy',
  'Revenge Trading',
  'FOMO',
  'Tired',
  'Frustrated',
] as const;

export type Symbol = (typeof SYMBOLS)[number];
export type Setup = (typeof SETUPS)[number];
export type Emotion = (typeof EMOTIONS)[number];

/** Plain-object shape of a Trade as it travels over the API (dates as ISO strings). */
export interface TradeDTO {
  id: string;
  date: string;
  symbol: string;
  customSymbol?: string;
  result: number;
  setup: string;
  customSetup?: string;
  emotion: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTrades {
  data: TradeDTO[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TradeFilters {
  from?: string;
  to?: string;
  symbol?: string;
  setup?: string;
  emotion?: string;
  outcome?: 'win' | 'loss' | 'all';
  sortBy?: 'date' | 'result' | 'symbol' | 'setup';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DashboardStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  lossRate: number;
  netProfit: number;
  grossProfit: number;
  grossLoss: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number | null;
  expectancy: number;
  averageTrade: number;
  currentStreak: { type: 'win' | 'loss' | 'none'; count: number };
  bestWinStreak: number;
  worstLossStreak: number;
}

export interface EquityPoint {
  date: string;
  cumulative: number;
  result: number;
}

export interface MonthlyPoint {
  month: string;
  profit: number;
}

export interface CategoryBreakdown {
  name: string;
  count: number;
  netResult: number;
}

export interface CalendarDay {
  date: string;
  netResult: number;
  trades: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  equityCurve: EquityPoint[];
  monthlyPerformance: MonthlyPoint[];
  winLossBreakdown: { name: 'Wins' | 'Losses'; value: number }[];
  bySymbol: CategoryBreakdown[];
  bySetup: CategoryBreakdown[];
  byEmotion: CategoryBreakdown[];
  calendar: CalendarDay[];
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
