import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { SelectApplicantsResponseSchema } from '@/features/campaign/lib/dto';

export const useSelectApplicants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      selectedIds,
    }: {
      campaignId: string;
      selectedIds: string[];
    }) => {
      const response = await apiClient.post(
        `/advertiser/campaigns/${campaignId}/select`,
        { selectedIds }
      );
      return SelectApplicantsResponseSchema.parse(response.data);
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['advertiserCampaignDetail', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['advertiserCampaigns'] });
    },
  });
};
