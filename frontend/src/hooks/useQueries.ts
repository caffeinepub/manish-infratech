import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Bill, BillOperation, PartySummary, CompanyReport, ProfitLossSummary } from '../backend';

// ─── Bills ───────────────────────────────────────────────────────────────────

export function useGetAllBills() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const bills = await actor.getAllBills();
        return bills ?? [];
      } catch (err) {
        console.error('getAllBills error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    staleTime: 30_000,
  });
}

export function useGetBill(invoiceNumber: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Bill | null>({
    queryKey: ['bill', invoiceNumber],
    queryFn: async () => {
      if (!actor || !invoiceNumber) return null;
      try {
        return await actor.getBill(invoiceNumber);
      } catch (err) {
        console.error('getBill error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!invoiceNumber,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useAddBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Bill, Error, BillOperation>({
    mutationFn: async (billOp: BillOperation) => {
      if (!actor) throw new Error('Actor not available. Please refresh the page and try again.');
      return actor.addBill(billOp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['partyNames'] });
      queryClient.invalidateQueries({ queryKey: ['productNames'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
    },
  });
}

export function useEditBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Bill, Error, { invoiceNumber: string; updatedBillOp: BillOperation }>({
    mutationFn: async ({ invoiceNumber, updatedBillOp }) => {
      if (!actor) throw new Error('Actor not available. Please refresh the page and try again.');
      return actor.editBill(invoiceNumber, updatedBillOp);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', variables.invoiceNumber] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
    },
  });
}

export function useDeleteBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Bill, Error, string>({
    mutationFn: async (invoiceNumber: string) => {
      if (!actor) throw new Error('Actor not available. Please refresh the page and try again.');
      return actor.deleteBill(invoiceNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
    },
  });
}

export function useBillExists(invoiceNumber: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['billExists', invoiceNumber],
    queryFn: async () => {
      if (!actor || !invoiceNumber) return false;
      try {
        return await actor.billExists(invoiceNumber);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!invoiceNumber,
  });
}

// ─── Party / GST ─────────────────────────────────────────────────────────────

export function useSavePartyGstNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { partyName: string; gstNumber: string }>({
    mutationFn: async ({ partyName, gstNumber }) => {
      if (!actor) throw new Error('Actor not available. Please refresh the page and try again.');
      return actor.savePartyGstNumber(partyName, gstNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partyGst'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
    },
  });
}

export function useGetPartyGstNumber(partyName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['partyGst', partyName],
    queryFn: async () => {
      if (!actor || !partyName) return '';
      try {
        return await actor.getPartyGstNumber(partyName);
      } catch {
        return '';
      }
    },
    enabled: !!actor && !actorFetching && !!partyName,
  });
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────

export function useGetUniquePartyNames() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['partyNames'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUniquePartyNames();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

export function useGetUniqueProductNames() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['productNames'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUniqueProductNames();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

// ─── Summaries & Reports ──────────────────────────────────────────────────────

export function useGetAggregate() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ totalAmount: number; totalGst: number }>({
    queryKey: ['aggregate'],
    queryFn: async () => {
      if (!actor) return { totalAmount: 0, totalGst: 0 };
      try {
        return await actor.getAggregate();
      } catch {
        return { totalAmount: 0, totalGst: 0 };
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useGetPartySummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PartySummary[]>({
    queryKey: ['partySummary'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPartySummary();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useGetPartySummaryByDateRange(from: bigint, to: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PartySummary[]>({
    queryKey: ['partySummaryByDate', from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPartySummaryByDateRange(from, to);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && from > 0n && to > 0n,
    staleTime: 30_000,
  });
}

export function useGetCompanyReport(partyName: string, from: bigint, to: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CompanyReport>({
    queryKey: ['companyReport', partyName, from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor || !partyName) {
        return { totalServiceAmount: 0, totalReceived: 0, totalPending: 0, bills: [] };
      }
      try {
        return await actor.getCompanyReport(partyName, from, to);
      } catch {
        return { totalServiceAmount: 0, totalReceived: 0, totalPending: 0, bills: [] };
      }
    },
    enabled: !!actor && !actorFetching && !!partyName && from > 0n && to > 0n,
    staleTime: 30_000,
  });
}

export function useGetProfitLossSummary(from: bigint, to: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProfitLossSummary>({
    queryKey: ['profitLoss', from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor) {
        return { totalBilled: 0, totalReceived: 0, totalOutstanding: 0, profitLossIndicator: false };
      }
      try {
        return await actor.getProfitLossSummary(from, to);
      } catch {
        return { totalBilled: 0, totalReceived: 0, totalOutstanding: 0, profitLossIndicator: false };
      }
    },
    enabled: !!actor && !actorFetching && from > 0n && to > 0n,
    staleTime: 30_000,
  });
}
