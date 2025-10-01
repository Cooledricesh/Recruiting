"use client";

import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useCampaignList } from "@/features/campaign/hooks/useCampaignList";
import type { CampaignListQuery } from "@/features/campaign/lib/dto";
import { CampaignCard } from "./CampaignCard";
import { CampaignEmpty } from "./CampaignEmpty";

type CampaignListProps = {
  filters: CampaignListQuery;
  onFilterChange: (filters: CampaignListQuery) => void;
};

export function CampaignList({ filters, onFilterChange }: CampaignListProps) {
  const { data, isLoading, error } = useCampaignList(filters);

  const handleLoadMore = () => {
    onFilterChange({
      ...filters,
      page: (filters.page ?? 1) + 1,
    });
  };

  const handleReset = () => {
    onFilterChange({
      status: "recruiting",
      sort: "latest",
      page: 1,
      limit: 20,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="mb-4 text-lg font-semibold text-red-600">
          데이터를 불러오는 중 오류가 발생했습니다
        </p>
        <Button variant="outline" onClick={handleReset}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!data || data.campaigns.length === 0) {
    return <CampaignEmpty onReset={handleReset} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {data.pagination.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="lg" onClick={handleLoadMore}>
            더보기
          </Button>
        </div>
      )}
    </div>
  );
}
