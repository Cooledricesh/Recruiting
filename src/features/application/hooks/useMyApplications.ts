"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type {
  MyApplicationsQuery,
  MyApplicationsResponse,
} from "@/features/application/lib/dto";

const fetchMyApplications = async (
  filters: MyApplicationsQuery
): Promise<MyApplicationsResponse> => {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append("status", filters.status);
  }
  params.append("page", String(filters.page ?? 1));
  params.append("limit", String(filters.limit ?? 10));

  const response = await apiClient.get<MyApplicationsResponse>(
    `/my/applications?${params.toString()}`
  );

  return response.data;
};

export const useMyApplications = (filters: MyApplicationsQuery) => {
  return useQuery({
    queryKey: ["my-applications", filters],
    queryFn: () => fetchMyApplications(filters),
    staleTime: 1000 * 60 * 5,
  });
};
