"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS_CATEGORIES } from "@/constants/business-categories";
import {
  CAMPAIGN_STATUS,
  CAMPAIGN_STATUS_LABELS,
} from "@/features/campaign/constants/campaign-status";
import type { CampaignListQuery } from "@/features/campaign/lib/dto";

type CampaignFilterProps = {
  filters: CampaignListQuery;
  onChange: (filters: CampaignListQuery) => void;
};

export function CampaignFilter({ filters, onChange }: CampaignFilterProps) {
  const handleReset = () => {
    onChange({
      status: "recruiting",
      sort: "latest",
      page: 1,
      limit: 20,
    });
  };

  const handleCategoryChange = (value: string) => {
    onChange({
      ...filters,
      category: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onChange({
      ...filters,
      status: value as "recruiting" | "closed" | "selected",
      page: 1,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          카테고리
        </span>
        <Select
          value={filters.category ?? "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {BUSINESS_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          모집상태
        </span>
        <Select
          value={filters.status ?? CAMPAIGN_STATUS.recruiting}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="sm" onClick={handleReset}>
        필터 초기화
      </Button>
    </div>
  );
}
