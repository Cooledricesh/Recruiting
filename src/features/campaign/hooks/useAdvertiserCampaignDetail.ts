import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { AdvertiserCampaignDetailResponseSchema } from '@/features/campaign/lib/dto';

export const useAdvertiserCampaignDetail = (campaignId: string) => {
  return useQuery({
    queryKey: ['advertiserCampaignDetail', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/advertiser/campaigns/${campaignId}`
      );
      return AdvertiserCampaignDetailResponseSchema.parse(response.data);
    },
  });
};
