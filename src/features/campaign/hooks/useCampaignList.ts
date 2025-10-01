"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type {
  CampaignListQuery,
  CampaignListResponse,
} from "@/features/campaign/lib/dto";

const fetchCampaignList = async (
  filters: CampaignListQuery
): Promise<CampaignListResponse> => {
  const params = new URLSearchParams();

  if (filters.category) {
    params.append("category", filters.category);
  }
  if (filters.status) {
    params.append("status", filters.status);
  }
  if (filters.sort) {
    params.append("sort", filters.sort);
  }
  params.append("page", String(filters.page ?? 1));
  params.append("limit", String(filters.limit ?? 20));

  const response = await apiClient.get<CampaignListResponse>(
    `/campaigns?${params.toString()}`
  );

  return response.data;
};

export const useCampaignList = (filters: CampaignListQuery) => {
  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: () => fetchCampaignList(filters),
    staleTime: 1000 * 60 * 5,
  });
};
