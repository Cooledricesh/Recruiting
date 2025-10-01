import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SignupRequest, SignupResponse } from '@/features/auth/backend/signup/schema';

export function useSignup() {
  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: async (data: SignupRequest) => {
      const response = await apiClient.post<SignupResponse>('/api/auth/signup', data);
      return response.data;
    },
  });
}