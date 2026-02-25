import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Bill, UserProfile, LineItem } from '../backend';
import { UserRole } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

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

// ─── User Profile ────────────────────────────────────────────────────────────

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

export function useAddBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      partyName,
      invoiceNumber,
      lineItems,
    }: {
      partyName: string;
      invoiceNumber: string;
      lineItems: Array<LineItem>;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBill(partyName, invoiceNumber, lineItems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate'] });
    },
  });
}

// ─── Aggregate ───────────────────────────────────────────────────────────────

export function useGetAggregate() {
  const { actor, isFetching } = useActor();

  return useQuery<{ totalAmount: number; totalGst: number }>({
    queryKey: ['aggregate'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAggregate();
    },
    enabled: !!actor && !isFetching,
  });
}
