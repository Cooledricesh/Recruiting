"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type {
  ProfileResponse,
  CreateProfileRequest,
  BusinessNumberDuplicateResponse,
} from '../lib/dto';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = ['advertiser', 'profile'];

export function useAdvertiserProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const profileQuery = useQuery<ProfileResponse | null>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/api/advertiser/profile');
        return data as ProfileResponse;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const createOrUpdateMutation = useMutation<
    ProfileResponse,
    Error,
    CreateProfileRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post('/api/advertiser/profile', request);
      return data as ProfileResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({
        title: '저장 완료',
        description: '광고주 정보가 성공적으로 저장되었습니다.',
      });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, '프로필 저장에 실패했습니다.');
      toast({
        title: '저장 실패',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const checkBusinessNumberDuplicate = async (
    businessNumber: string,
    excludeUserId?: string
  ): Promise<boolean> => {
    try {
      const url = `/api/advertiser/business-number/${businessNumber}/duplicate${
        excludeUserId ? `?excludeUserId=${excludeUserId}` : ''
      }`;
      const { data } = await apiClient.get(url);
      const response = data as BusinessNumberDuplicateResponse;
      return response.isDuplicate;
    } catch (error) {
      return false;
    }
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,

    createOrUpdateProfile: createOrUpdateMutation.mutate,
    isCreatingOrUpdating: createOrUpdateMutation.isPending,

    checkBusinessNumberDuplicate,

    refetch: profileQuery.refetch,
  };
}
