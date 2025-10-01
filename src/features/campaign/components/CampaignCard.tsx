"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CampaignResponse } from "@/features/campaign/lib/dto";
import {
  CAMPAIGN_STATUS_LABELS,
  type CampaignStatus,
} from "@/features/campaign/constants/campaign-status";
import { BUSINESS_CATEGORIES } from "@/constants/business-categories";

type CampaignCardProps = {
  campaign: CampaignResponse;
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const categoryLabel =
    BUSINESS_CATEGORIES.find((cat) => cat.value === campaign.category)?.label ??
    campaign.category;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy.MM.dd", { locale: ko });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${campaign.id}/400/300`}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {campaign.isDeadlineSoon && (
          <Badge className="absolute right-2 top-2 bg-red-500 text-white">
            마감임박
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {campaign.title}
          </h3>
          <Badge variant="outline">
            {CAMPAIGN_STATUS_LABELS[campaign.status as CampaignStatus]}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {campaign.companyName}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{categoryLabel}</Badge>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{campaign.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(campaign.recruitmentStart)} ~{" "}
              {formatDate(campaign.recruitmentEnd)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>모집 인원: {campaign.recruitmentCount}명</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
            {campaign.benefits}
          </p>
        </div>

        {campaign.daysRemaining !== undefined && campaign.daysRemaining >= 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            D-{campaign.daysRemaining}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
