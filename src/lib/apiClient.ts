import {
  ApiError,
  DashboardResponse,
  PaginatedTrades,
  TradeDTO,
  TradeFilters,
} from '@/types/trade';
import { TradeInput } from '@/validators/trade';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    const err = body as ApiError;
    throw new Error(err.error || 'Request failed');
  }
  return body as T;
}

function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  trades: {
    list: (filters: TradeFilters): Promise<PaginatedTrades> =>
      fetch(`/api/trades${toQueryString(filters)}`).then((r) => handleResponse(r)),

    get: (id: string): Promise<TradeDTO> => fetch(`/api/trades/${id}`).then((r) => handleResponse(r)),

    create: (input: TradeInput): Promise<TradeDTO> =>
      fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => handleResponse(r)),

    update: (id: string, input: TradeInput): Promise<TradeDTO> =>
      fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => handleResponse(r)),

    delete: (id: string): Promise<{ success: boolean }> =>
      fetch(`/api/trades/${id}`, { method: 'DELETE' }).then((r) => handleResponse(r)),
  },

  dashboard: {
    get: (filters: Partial<TradeFilters> = {}): Promise<DashboardResponse> =>
      fetch(`/api/dashboard${toQueryString(filters)}`).then((r) => handleResponse(r)),
  },
};
