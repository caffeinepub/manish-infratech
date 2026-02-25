import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Bill, BillOperation, PartySummary, CompanyReport, ProfitLossSummary, UserProfile } from '../backend';
import { UserRole } from '../backend';

// ─── User Role ────────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Bills ────────────────────────────────────────────────────────────────────

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

export function useAddBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, BillOperation>({
    mutationFn: async (billOp: BillOperation) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBill(billOp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
      queryClient.invalidateQueries({ queryKey: ['partyNames'] });
      queryClient.invalidateQueries({ queryKey: ['productNames'] });
    },
  });
}

export function useEditBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, { invoiceNumber: string; billOp: BillOperation }>({
    mutationFn: async ({ invoiceNumber, billOp }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBill(invoiceNumber, billOp);
    },
    onSuccess: (_, { invoiceNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', invoiceNumber] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
      queryClient.invalidateQueries({ queryKey: ['companyReport'] });
      queryClient.invalidateQueries({ queryKey: ['productNames'] });
    },
  });
}

export function useDeleteBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, string>({
    mutationFn: async (invoiceNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBill(invoiceNumber);
    },
    onSuccess: (_data, invoiceNumber) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
      queryClient.removeQueries({ queryKey: ['bill', invoiceNumber] });
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
      queryClient.invalidateQueries({ queryKey: ['companyReport'] });
    },
  });
}

export function useBillExists() {
  const { actor } = useActor();
  return async (invoiceNumber: string): Promise<boolean> => {
    if (!actor) return false;
    return actor.billExists(invoiceNumber);
  };
}

// ─── Party Summary ────────────────────────────────────────────────────────────

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

export function useGetPartySummaryByDateRange(from: bigint | null, to: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PartySummary[]>({
    queryKey: ['partySummary', from?.toString(), to?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (from !== null && to !== null) {
        return actor.getPartySummaryByDateRange(from, to);
      }
      return actor.getPartySummary();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Party GST Number ─────────────────────────────────────────────────────────

export function useSavePartyGstNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { partyName: string; gstNumber: string }>({
    mutationFn: async ({ partyName, gstNumber }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePartyGstNumber(partyName, gstNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partySummary'] });
      queryClient.invalidateQueries({ queryKey: ['partyGst'] });
    },
  });
}

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

// ─── Company Report ───────────────────────────────────────────────────────────

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

// ─── Profit & Loss ────────────────────────────────────────────────────────────

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

// ─── Autocomplete: Party Names ────────────────────────────────────────────────

export function useGetPartyNames() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['partyNames'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPartyNames();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Autocomplete: Product Names ──────────────────────────────────────────────

export function useGetProductNames() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['productNames'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductNames();
    },
    enabled: !!actor && !isFetching,
  });
}
