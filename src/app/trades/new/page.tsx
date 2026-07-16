'use client';

import { useRouter } from 'next/navigation';
import { TradeForm } from '@/components/trades/trade-form';
import { useCreateTrade } from '@/hooks/useTrades';
import { TradeInput } from '@/validators/trade';

export default function NewTradePage() {
  const router = useRouter();
  const createTrade = useCreateTrade();

  async function handleSubmit(input: TradeInput) {
    await createTrade.mutateAsync(input);
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Add Trade</h1>
        <p className="text-sm text-muted-foreground">Log the details while they're fresh.</p>
      </div>
      <TradeForm onSubmit={handleSubmit} submitting={createTrade.isPending} submitLabel="Add Trade" />
    </div>
  );
}
