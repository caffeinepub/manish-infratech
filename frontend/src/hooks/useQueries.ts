import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Bill, BillOperation, PartySummary, CompanyReport, ProfitLossSummary } from '../backend';

// ─── Bills ───────────────────────────────────────────────────────────────────

export function useGetAllBills() {
  const { actor, isFetching } = useActor();
  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBill(invoiceNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Bill>({
    queryKey: ['bill', invoiceNumber],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBill(invoiceNumber);
    },
    enabled: !!actor && !isFetching && !!invoiceNumber,
  });
}

export function useCheckBillExists(invoiceNumber: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['billExists', invoiceNumber],
    queryFn: async () => {
      if (!actor) return false;
      return actor.billExists(invoiceNumber);
    },
    enabled: !!actor && !isFetching && enabled && !!invoiceNumber,
  });
}

export function useAddBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billOp: BillOperation) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBill(billOp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.invalidateQueries({ queryKey: ['uniquePartyNames'] });
      queryClient.invalidateQueries({ queryKey: ['uniqueProductNames'] });
    },
  });
}

export function useEditBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceNumber, billOp }: { invoiceNumber: string; billOp: BillOperation }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBill(invoiceNumber, billOp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
    },
  });
}

export function useDeleteBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBill(invoiceNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
    },
  });
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────

export function useGetUniquePartyNames() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['uniquePartyNames'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUniquePartyNames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUniqueProductNames() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['uniqueProductNames'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUniqueProductNames();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Party / GST ─────────────────────────────────────────────────────────────

export function useGetPartyGstNumber(partyName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['partyGst', partyName],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getPartyGstNumber(partyName);
    },
    enabled: !!actor && !isFetching && !!partyName,
  });
}

export function useSavePartyGstNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ partyName, gstNumber }: { partyName: string; gstNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePartyGstNumber(partyName, gstNumber);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partyGst', variables.partyName] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
    },
  });
}

// ─── Summaries ────────────────────────────────────────────────────────────────

export function useGetPartySummary() {
  const { actor, isFetching } = useActor();
  return useQuery<PartySummary[]>({
    queryKey: ['partySummary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPartySummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartySummaryByDateRange(from: bigint, to: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<PartySummary[]>({
    queryKey: ['partySummaryRange', from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPartySummaryByDateRange(from, to);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAggregate() {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalAmount: number; totalGst: number }>({
    queryKey: ['aggregate'],
    queryFn: async () => {
      if (!actor) return { totalAmount: 0, totalGst: 0 };
      return actor.getAggregate();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCompanyReport(partyName: string, from: bigint, to: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<CompanyReport>({
    queryKey: ['companyReport', partyName, from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCompanyReport(partyName, from, to);
    },
    enabled: !!actor && !isFetching && !!partyName,
  });
}

export function useGetProfitLossSummary(from: bigint, to: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<ProfitLossSummary>({
    queryKey: ['profitLoss', from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProfitLossSummary(from, to);
    },
    enabled: !!actor && !isFetching,
  });
}
