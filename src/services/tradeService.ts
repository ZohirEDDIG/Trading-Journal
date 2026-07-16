import { tradeRepository } from '@/repositories/tradeRepository';
import { TradeFiltersInput, TradeInput } from '@/validators/trade';
import { PaginatedTrades, TradeDTO } from '@/types/trade';
import { ITrade } from '@/models/Trade';

type LeanTrade = ITrade & { _id: unknown };

export function toTradeDTO(trade: LeanTrade): TradeDTO {
  return {
    id: String(trade._id),
    date: new Date(trade.date).toISOString(),
    symbol: trade.symbol,
    customSymbol: trade.customSymbol,
    result: trade.result,
    setup: trade.setup,
    customSetup: trade.customSetup,
    emotion: trade.emotion,
    notes: trade.notes,
    createdAt: new Date(trade.createdAt).toISOString(),
    updatedAt: new Date(trade.updatedAt).toISOString(),
  };
}

export const tradeService = {
  async list(userId: string, filters: TradeFiltersInput): Promise<PaginatedTrades> {
    const { data, total, page, pageSize } = await tradeRepository.findMany(userId, filters);
    return {
      data: (data as unknown as LeanTrade[]).map(toTradeDTO),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(userId: string, id: string): Promise<TradeDTO | null> {
    const trade = await tradeRepository.findById(userId, id);
    if (!trade) return null;
    return toTradeDTO(trade as unknown as LeanTrade);
  },

  async create(userId: string, input: TradeInput): Promise<TradeDTO> {
    const trade = await tradeRepository.create(userId, input);
    return toTradeDTO(trade.toObject() as LeanTrade);
  },

  async update(userId: string, id: string, input: TradeInput): Promise<TradeDTO | null> {
    const trade = await tradeRepository.update(userId, id, input);
    if (!trade) return null;
    return toTradeDTO(trade as unknown as LeanTrade);
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const trade = await tradeRepository.delete(userId, id);
    return !!trade;
  },
};
