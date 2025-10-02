"use client";

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
  const categoryLabel =
    BUSINESS_CATEGORIES.find((cat) => cat.value === category)?.label ?? category;

  return (
    <div className="space-y-4">
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
