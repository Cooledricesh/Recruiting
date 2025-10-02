"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { canApply, isRecruitmentClosed } from "@/lib/campaign-utils";
import type { CampaignStatus } from "@/features/campaign/constants/campaign-status";
import { CampaignApplyForm } from "./CampaignApplyForm";

type CampaignApplyButtonProps = {
  campaignId: string;
  recruitmentStart: string;
  recruitmentEnd: string;
  status: CampaignStatus;
  hasApplied: boolean;
  hasInfluencerProfile: boolean;
};

export function CampaignApplyButton({
  campaignId,
  recruitmentStart,
  recruitmentEnd,
  status,
  hasApplied,
  hasInfluencerProfile,
}: CampaignApplyButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isApplicable = canApply(
    recruitmentStart,
    recruitmentEnd,
    status,
    hasApplied
  );

  const isClosed = isRecruitmentClosed(recruitmentEnd, status);

  const getButtonContent = () => {
    if (!hasInfluencerProfile) {
      return {
        text: "인플루언서 등록이 필요합니다",
        disabled: true,
        variant: "secondary" as const,
      };
    }

    if (hasApplied) {
      return {
        text: "이미 지원한 체험단입니다",
        disabled: true,
        variant: "secondary" as const,
      };
    }

    if (isClosed) {
      return {
        text: "모집이 마감되었습니다",
        disabled: true,
        variant: "secondary" as const,
      };
    }

    if (isApplicable) {
      return {
        text: "지원하기",
        disabled: false,
        variant: "default" as const,
      };
    }

    return {
      text: "모집 예정입니다",
      disabled: true,
      variant: "secondary" as const,
    };
  };

  const buttonProps = getButtonContent();

  const handleClick = () => {
    if (isApplicable && !buttonProps.disabled) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 border-t bg-white p-4 dark:bg-slate-950">
        <Button
          onClick={handleClick}
          disabled={buttonProps.disabled}
          variant={buttonProps.variant}
          size="lg"
          className="w-full"
        >
          {buttonProps.text}
        </Button>
      </div>

      <CampaignApplyForm
        campaignId={campaignId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        recruitmentEnd={recruitmentEnd}
      />
    </>
  );
}
