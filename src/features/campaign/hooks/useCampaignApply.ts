"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type {
  ApplicationRequest,
  ApplicationResponse,
} from "@/features/campaign/lib/dto";
import { useToast } from "@/hooks/use-toast";

const applyCampaign = async (
  campaignId: string,
  data: ApplicationRequest
): Promise<ApplicationResponse> => {
  const response = await apiClient.post<ApplicationResponse>(
    `/campaigns/${campaignId}/apply`,
    data
  );
  return response.data;
};

export const useCampaignApply = (campaignId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ApplicationRequest) => applyCampaign(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast({
        title: "지원 완료",
        description: "체험단 지원이 완료되었습니다.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        "지원에 실패했습니다. 다시 시도해주세요.";

      toast({
        title: "지원 실패",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
