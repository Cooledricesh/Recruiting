import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type {
  CheckEmailRequest,
  CheckEmailResponse
} from '@/features/auth/backend/signup/schema';

export function useEmailCheck() {
  return useMutation<CheckEmailResponse, Error, CheckEmailRequest>({
    mutationFn: async (data: CheckEmailRequest) => {
      const response = await apiClient.post<CheckEmailResponse>('/api/auth/check-email', data);
      return response.data;
    },
  });
}