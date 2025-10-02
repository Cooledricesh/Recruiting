"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CAMPAIGN_STATUS_LABELS,
  type CampaignStatus,
} from "@/features/campaign/constants/campaign-status";
import { BUSINESS_CATEGORIES } from "@/constants/business-categories";

type CampaignDetailHeaderProps = {
  title: string;
  companyName: string;
  category: string;
  status: CampaignStatus;
  isDeadlineSoon: boolean;
};

export function CampaignDetailHeader({
  title,
  companyName,
  category,
  status,
  isDeadlineSoon,
}: CampaignDetailHeaderProps) {
  const router = useRouter();
  const categoryLabel =
    BUSINESS_CATEGORIES.find((cat) => cat.value === category)?.label ?? category;

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="mb-2 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {companyName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDeadlineSoon && status === "recruiting" && (
            <Badge className="bg-red-500 text-white">마감임박</Badge>
          )}
          <Badge variant="outline">
            {CAMPAIGN_STATUS_LABELS[status]}
          </Badge>
          <Badge variant="secondary">{categoryLabel}</Badge>
        </div>
      </div>
    </div>
  );
}
