"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type {
  ProfileResponse,
  CreateProfileRequest,
  Channel,
} from '../lib/dto';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = ['influencer', 'profile'];

export function useInfluencerProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 프로필 조회
  const profileQuery = useQuery<ProfileResponse | null>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/api/influencer/profile');
        return data as ProfileResponse;
      } catch (error: any) {
        // 404는 프로필이 없는 정상 케이스
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1,
  });

  // 프로필 생성/업데이트
  const createOrUpdateMutation = useMutation<
    ProfileResponse,
    Error,
    CreateProfileRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post('/api/influencer/profile', request);
      return data as ProfileResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({
        title: '저장 완료',
        description: '인플루언서 정보가 성공적으로 저장되었습니다.',
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

  // 채널 추가
  const addChannelMutation = useMutation<
    { channelId: string },
    Error,
    Channel
  >({
    mutationFn: async (channel) => {
      const { data } = await apiClient.post('/api/influencer/channels', {
        channel,
      });
      return data as { channelId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({
        title: '채널 추가 완료',
        description: 'SNS 채널이 추가되었습니다.',
      });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, '채널 추가에 실패했습니다.');
      toast({
        title: '채널 추가 실패',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // 채널 삭제
  const deleteChannelMutation = useMutation<
    { success: boolean },
    Error,
    string
  >({
    mutationFn: async (channelId) => {
      const { data } = await apiClient.delete(
        `/api/influencer/channels/${channelId}`
      );
      return data as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({
        title: '채널 삭제 완료',
        description: 'SNS 채널이 삭제되었습니다.',
      });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, '채널 삭제에 실패했습니다.');
      toast({
        title: '채널 삭제 실패',
        description: message,
        variant: 'destructive',
      });
    },
  });

  return {
    // 프로필 데이터
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,

    // Mutations
    createOrUpdateProfile: createOrUpdateMutation.mutate,
    isCreatingOrUpdating: createOrUpdateMutation.isPending,

    addChannel: addChannelMutation.mutate,
    isAddingChannel: addChannelMutation.isPending,

    deleteChannel: deleteChannelMutation.mutate,
    isDeletingChannel: deleteChannelMutation.isPending,

    // 유틸리티
    refetch: profileQuery.refetch,
  };
}