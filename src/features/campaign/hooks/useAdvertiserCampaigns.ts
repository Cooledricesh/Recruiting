'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { AdvertiserCampaignListResponse } from '@/features/campaign/lib/dto';

interface UseAdvertiserCampaignsParams {
  status?: 'recruiting' | 'closed' | 'selected';
  sort?: 'latest' | 'deadline';
  page?: number;
  limit?: number;
}

export const useAdvertiserCampaigns = (params: UseAdvertiserCampaignsParams = {}) => {
  return useQuery({
    queryKey: ['advertiser', 'campaigns', params],
    queryFn: async () => {
      const response = await apiClient.get<AdvertiserCampaignListResponse>(
        '/advertiser/campaigns',
        { params }
      );
      return response.data;
    },
  });
};
