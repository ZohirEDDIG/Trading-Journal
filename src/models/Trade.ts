import { Schema, model, models, Model, Document } from 'mongoose';

export interface ITrade extends Document {
  userId: Schema.Types.ObjectId;
  date: Date;
  symbol: string;
  customSymbol?: string;
  result: number;
  setup: string;
  customSetup?: string;
  emotion: string;
  notes?: string;
  // --- Future-proofing ---------------------------------------------------
  // These fields are intentionally absent from the schema today because the
  // product spec doesn't need them yet. When they're needed, add them here
  // and to src/types/trade.ts + src/validators/trade.ts; because reads go
  // through the repository/service layer and the API always returns a
  // mapped DTO (see toTradeDTO), new fields flow through automatically
  // without touching route handlers.
  //
  //   tags?: string[];
  //   riskReward?: number;
  //   positionSize?: number;
  //   stopLoss?: number;
  //   takeProfit?: number;
  //   timeframe?: string;
  //   screenshotUrl?: string;
  //   strategyId?: Schema.Types.ObjectId;
  //   portfolioId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    date: { type: Date, required: true, index: true },
    symbol: { type: String, required: true, index: true },
    customSymbol: { type: String, trim: true },
    result: { type: Number, required: true },
    setup: { type: String, required: true, index: true },
    customSetup: { type: String, trim: true },
    emotion: { type: String, required: true },
    notes: { type: String, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

// Compound index to speed up the common "this user's recent trades, filtered" query.
TradeSchema.index({ userId: 1, date: -1, symbol: 1, setup: 1 });

export const Trade: Model<ITrade> =
  (models.Trade as Model<ITrade>) || model<ITrade>('Trade', TradeSchema);
