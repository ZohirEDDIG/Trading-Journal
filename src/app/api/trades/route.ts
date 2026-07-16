import { NextRequest } from 'next/server';
import { UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { tradeFiltersSchema, tradeInputSchema } from '@/validators/trade';
import { tradeService } from '@/services/tradeService';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const filters = tradeFiltersSchema.parse(params);
    return tradeService.list(session.user.id, filters);
  });
}

export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const body = await request.json();
    const input = tradeInputSchema.parse(body);
    return tradeService.create(session.user.id, input);
  });
}
