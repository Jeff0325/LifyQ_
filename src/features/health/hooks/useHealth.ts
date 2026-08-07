import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  allergiesRepository,
  healthEventsRepository,
  medicinesRepository,
  vitalsRepository,
} from '@/features/health/repository';
import type {
  CreateAllergyInput,
  CreateHealthEventInput,
  CreateMedicineInput,
  CreateVitalInput,
  UpdateAllergyInput,
  UpdateHealthEventInput,
  UpdateMedicineInput,
} from '@/features/health/types';

export const healthKeys = {
  medicines: ['health', 'medicines'] as const,
  events: ['health', 'events'] as const,
  vitals: ['health', 'vitals'] as const,
  allergies: ['health', 'allergies'] as const,
};

// Medicines
export function useMedicines() {
  return useQuery({
    queryKey: healthKeys.medicines,
    queryFn: () => medicinesRepository.list(),
  });
}
export function useCreateMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMedicineInput) =>
      medicinesRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.medicines }),
  });
}
export function useUpdateMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMedicineInput }) =>
      medicinesRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.medicines }),
  });
}
export function useDeleteMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicinesRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.medicines }),
  });
}

// Health Events (vaccinations / doctor visits)
export function useHealthEvents() {
  return useQuery({
    queryKey: healthKeys.events,
    queryFn: () => healthEventsRepository.list(),
  });
}
export function useCreateHealthEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHealthEventInput) =>
      healthEventsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.events }),
  });
}
export function useUpdateHealthEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateHealthEventInput;
    }) => healthEventsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.events }),
  });
}
export function useDeleteHealthEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthEventsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.events }),
  });
}

// Vitals
export function useVitals() {
  return useQuery({
    queryKey: healthKeys.vitals,
    queryFn: () => vitalsRepository.list(),
  });
}
export function useCreateVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVitalInput) => vitalsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.vitals }),
  });
}
export function useDeleteVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vitalsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.vitals }),
  });
}

// Allergies
export function useAllergies() {
  return useQuery({
    queryKey: healthKeys.allergies,
    queryFn: () => allergiesRepository.list(),
  });
}
export function useCreateAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAllergyInput) =>
      allergiesRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.allergies }),
  });
}
export function useUpdateAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAllergyInput }) =>
      allergiesRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.allergies }),
  });
}
export function useDeleteAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => allergiesRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: healthKeys.allergies }),
  });
}
