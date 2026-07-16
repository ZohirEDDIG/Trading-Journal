import { FilterQuery, SortOrder } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Trade, ITrade } from '@/models/Trade';
import { TradeFiltersInput, TradeInput } from '@/validators/trade';

function buildFilterQuery(userId: string, filters: Partial<TradeFiltersInput>): FilterQuery<ITrade> {
  const query: FilterQuery<ITrade> = { userId };

  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(filters.from);
    if (filters.to) query.date.$lte = new Date(filters.to);
  }
  if (filters.symbol) query.symbol = filters.symbol;
  if (filters.setup) query.setup = filters.setup;
  if (filters.emotion) query.emotion = filters.emotion;
  if (filters.outcome === 'win') query.result = { $gt: 0 };
  if (filters.outcome === 'loss') query.result = { $lt: 0 };

  return query;
}

export const tradeRepository = {
  async findMany(userId: string, filters: TradeFiltersInput) {
    await connectToDatabase();
    const query = buildFilterQuery(userId, filters);

    const sortField = filters.sortBy ?? 'date';
    const sortDir: SortOrder = filters.sortDir === 'asc' ? 1 : -1;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const [data, total] = await Promise.all([
      Trade.find(query)
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Trade.countDocuments(query),
    ]);

    return { data, total, page, pageSize };
  },

  /** Returns every trade matching the (date-range only, typically) filters — used by the dashboard, unpaginated. */
  async findAllForStats(userId: string, filters: Partial<TradeFiltersInput> = {}) {
    await connectToDatabase();
    const query = buildFilterQuery(userId, filters);
    return Trade.find(query).sort({ date: 1 }).lean();
  },

  async findById(userId: string, id: string) {
    await connectToDatabase();
    return Trade.findOne({ _id: id, userId }).lean();
  },

  async create(userId: string, input: TradeInput) {
    await connectToDatabase();
    return Trade.create({ ...input, userId, date: new Date(input.date) });
  },

  async update(userId: string, id: string, input: TradeInput) {
    await connectToDatabase();
    return Trade.findOneAndUpdate(
      { _id: id, userId },
      { ...input, date: new Date(input.date) },
      { new: true, runValidators: true }
    ).lean();
  },

  async delete(userId: string, id: string) {
    await connectToDatabase();
    return Trade.findOneAndDelete({ _id: id, userId }).lean();
  },
};
