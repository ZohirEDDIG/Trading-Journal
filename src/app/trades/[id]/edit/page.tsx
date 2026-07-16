'use client';

import { useParams, useRouter } from 'next/navigation';
import { TradeForm } from '@/components/trades/trade-form';
import { useTrade, useUpdateTrade } from '@/hooks/useTrades';
import { TradeInput } from '@/validators/trade';
import { Skeleton } from '@/components/ui/misc';

export default function EditTradePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: trade, isLoading } = useTrade(params.id);
  const updateTrade = useUpdateTrade(params.id);

  async function handleSubmit(input: TradeInput) {
    await updateTrade.mutateAsync(input);
    router.push(`/trades/${params.id}`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!trade) {
    return <p className="text-sm text-muted-foreground">Trade not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit Trade</h1>
        <p className="text-sm text-muted-foreground">Update the details of this trade.</p>
      </div>
      <TradeForm
        defaultValues={trade}
        onSubmit={handleSubmit}
        submitting={updateTrade.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
