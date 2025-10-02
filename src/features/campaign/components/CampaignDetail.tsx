"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignDetail } from "@/features/campaign/hooks/useCampaignDetail";
import { CampaignDetailHeader } from "./CampaignDetailHeader";
import { CampaignDetailInfo } from "./CampaignDetailInfo";
import { CampaignDetailLocation } from "./CampaignDetailLocation";
import { CampaignApplyButton } from "./CampaignApplyButton";

type CampaignDetailProps = {
  campaignId: string;
};

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const { data, isLoading, error, refetch } = useCampaignDetail(campaignId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            체험단 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            데이터를 불러올 수 없습니다.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-slate-700 dark:text-slate-300">
          체험단을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-24">
      <CampaignDetailHeader
        title={data.title}
        companyName={data.companyName}
        category={data.category}
        status={data.status}
        isDeadlineSoon={data.isDeadlineSoon}
      />

      <CampaignDetailInfo
        recruitmentStart={data.recruitmentStart}
        recruitmentEnd={data.recruitmentEnd}
        recruitmentCount={data.recruitmentCount}
        benefits={data.benefits}
        mission={data.mission}
        daysRemaining={data.daysRemaining}
      />

      <CampaignDetailLocation
        storeInfo={data.storeInfo}
        location={data.location}
        storePhone={data.advertiser.storePhone}
      />

      <CampaignApplyButton
        campaignId={data.id}
        recruitmentStart={data.recruitmentStart}
        recruitmentEnd={data.recruitmentEnd}
        status={data.status}
        hasApplied={data.hasApplied}
        hasInfluencerProfile={data.hasInfluencerProfile}
      />
    </div>
  );
}
