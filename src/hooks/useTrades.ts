import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/apiClient';
import { TradeFilters } from '@/types/trade';
import { TradeInput } from '@/validators/trade';

export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: TradeFilters) => [...tradeKeys.lists(), filters] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
  dashboard: (filters: Partial<TradeFilters>) => ['dashboard', filters] as const,
};

export function useTrades(filters: TradeFilters) {
  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: () => api.trades.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: tradeKeys.detail(id),
    queryFn: () => api.trades.get(id),
    enabled: !!id,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TradeInput) => api.trades.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Trade added');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not add trade'),
  });
}

export function useUpdateTrade(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TradeInput) => api.trades.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Trade updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update trade'),
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.trades.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Trade deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not delete trade'),
  });
}

export function useDashboard(filters: Partial<TradeFilters> = {}) {
  return useQuery({
    queryKey: tradeKeys.dashboard(filters),
    queryFn: () => api.dashboard.get(filters),
  });
}
