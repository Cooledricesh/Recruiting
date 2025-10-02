"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { CampaignDetailResponse } from "@/features/campaign/lib/dto";

const fetchCampaignDetail = async (
  campaignId: string
): Promise<CampaignDetailResponse> => {
  const response = await apiClient.get<CampaignDetailResponse>(
    `/campaigns/${campaignId}`
  );
  return response.data;
};

export const useCampaignDetail = (campaignId: string) => {
  return useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: () => fetchCampaignDetail(campaignId),
    staleTime: 1000 * 60 * 5,
  });
};
