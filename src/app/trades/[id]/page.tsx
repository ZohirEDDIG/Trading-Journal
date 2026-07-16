'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useDeleteTrade, useTrade } from '@/hooks/useTrades';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/misc';
import { Skeleton } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDate, formatSignedCurrency } from '@/utils/format';

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: trade, isLoading } = useTrade(params.id);
  const deleteTrade = useDeleteTrade();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    if (!trade) return;
    await deleteTrade.mutateAsync(trade.id);
    router.push('/');
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trade) {
    return <p className="text-sm text-muted-foreground">Trade not found.</p>;
  }

  const isWin = trade.result > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{formatDate(trade.date)}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {trade.symbol === 'Other' ? trade.customSymbol : trade.symbol}
            </h1>
          </div>
          <p className={`font-mono text-2xl font-semibold ${isWin ? 'text-success' : 'text-danger'}`}>
            {formatSignedCurrency(trade.result)}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="neutral">{trade.setup === 'Other' ? trade.customSetup : trade.setup}</Badge>
          <Badge variant="neutral">{trade.emotion}</Badge>
          <Badge variant={isWin ? 'win' : 'loss'}>{isWin ? 'Win' : 'Loss'}</Badge>
        </div>

        {trade.notes && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{trade.notes}</p>
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          <Trash2 size={14} />
          Delete
        </Button>
        <Link href={`/trades/${trade.id}/edit`}>
          <Button variant="secondary">
            <Pencil size={14} />
            Edit
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this trade?"
        description="This action can't be undone."
        loading={deleteTrade.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
