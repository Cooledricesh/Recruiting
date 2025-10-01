"use client";

import { Button } from "@/components/ui/button";
import { SORT_OPTIONS } from "@/features/campaign/constants/campaign-status";

type CampaignSortProps = {
  sort: "latest" | "deadline";
  onChange: (sort: "latest" | "deadline") => void;
};

export function CampaignSort({ sort, onChange }: CampaignSortProps) {
  return (
    <div className="flex items-center gap-2">
      {SORT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={sort === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
