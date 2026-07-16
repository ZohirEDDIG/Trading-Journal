import { NextRequest } from 'next/server';
import { NotFoundError, UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { tradeUpdateSchema } from '@/validators/trade';
import { tradeService } from '@/services/tradeService';
import { auth } from '@/lib/auth';

interface RouteParams {
  // Next.js 15 made route handler params an async value (Promise), matching
  // the same change made to page-level params/searchParams.
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const trade = await tradeService.getById(session.user.id, id);
    if (!trade) throw new NotFoundError('Trade not found');
    return trade;
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const body = await request.json();
    const input = tradeUpdateSchema.parse(body);
    const trade = await tradeService.update(session.user.id, id, input);
    if (!trade) throw new NotFoundError('Trade not found');
    return trade;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const deleted = await tradeService.delete(session.user.id, id);
    if (!deleted) throw new NotFoundError('Trade not found');
    return { success: true };
  });
}
