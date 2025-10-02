import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { CloseCampaignResponseSchema } from '@/features/campaign/lib/dto';

export const useCloseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiClient.put(
        `/advertiser/campaigns/${campaignId}/close`
      );
      return CloseCampaignResponseSchema.parse(response.data);
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['advertiserCampaignDetail', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['advertiserCampaigns'] });
    },
  });
};
