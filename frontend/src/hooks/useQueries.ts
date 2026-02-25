import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Bill, BillOperation, CompanySettings, PartyProfile } from '../backend';

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

export function useGetUniquePartyNames() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['partyNames'],
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
    queryKey: ['productNames'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUniqueProductNames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartyProfile(partyName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PartyProfile>({
    queryKey: ['partyProfile', partyName],
    queryFn: async () => {
      if (!actor) return { gstNumber: '', address: '' };
      return actor.getPartyProfile(partyName);
    },
    enabled: !!actor && !isFetching && !!partyName,
  });
}

export function useGetPartySummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['partySummary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPartySummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartySummaryByDateRange(from: number, to: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['partySummaryByDateRange', from, to],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPartySummaryByDateRange(BigInt(from), BigInt(to));
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

export function useGetProfitLossSummary(from: number, to: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['profitLoss', from, to],
    queryFn: async () => {
      if (!actor) return { totalBilled: 0, totalReceived: 0, totalOutstanding: 0, profitLossIndicator: false };
      return actor.getProfitLossSummary(BigInt(from), BigInt(to));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCompanyReport(partyName: string, from: number, to: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['companyReport', partyName, from, to],
    queryFn: async () => {
      if (!actor) return { totalServiceAmount: 0, totalReceived: 0, totalPending: 0, bills: [] };
      return actor.getCompanyReport(partyName, BigInt(from), BigInt(to));
    },
    enabled: !!actor && !isFetching && !!partyName,
  });
}

export function useGetCompanySettings() {
  const { actor, isFetching } = useActor();
  return useQuery<CompanySettings | null>({
    queryKey: ['companySettings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCompanySettings();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['partyNames'] });
    },
  });
}

export function useEditBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceNumber, updatedBillOp }: { invoiceNumber: string; updatedBillOp: BillOperation }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBill(invoiceNumber, updatedBillOp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['bill'] });
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
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['partyProfile', variables.partyName] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
    },
  });
}

export function useSavePartyAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ partyName, address }: { partyName: string; address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePartyAddress(partyName, address);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partyProfile', variables.partyName] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
    },
  });
}

export function useSaveCompanySettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: CompanySettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCompanySettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
    },
  });
}
