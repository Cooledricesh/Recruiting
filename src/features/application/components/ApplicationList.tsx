"use client";

import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useMyApplications } from "@/features/application/hooks/useMyApplications";
import type { MyApplicationsQuery } from "@/features/application/lib/dto";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationFilter } from "./ApplicationFilter";
import { ApplicationEmpty } from "./ApplicationEmpty";

type ApplicationListProps = {
  filters: MyApplicationsQuery;
  onFilterChange: (filters: MyApplicationsQuery) => void;
};

export function ApplicationList({
  filters,
  onFilterChange,
}: ApplicationListProps) {
  const { data, isLoading, error } = useMyApplications(filters);

  const handleLoadMore = () => {
    onFilterChange({
      ...filters,
      page: (filters.page ?? 1) + 1,
    });
  };

  const handleReset = () => {
    onFilterChange({
      page: 1,
      limit: 10,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, index) => (
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

  if (!data || data.applications.length === 0) {
    return <ApplicationEmpty currentStatus={filters.status} />;
  }

  return (
    <div className="space-y-6">
      <ApplicationFilter
        currentStatus={filters.status}
        onChange={(status) =>
          onFilterChange({ ...filters, status, page: 1 })
        }
      />

      <div className="space-y-4">
        {data.applications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
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
