'use client';

import { useState } from 'react';
import { useAdvertiserCampaigns } from '@/features/campaign/hooks/useAdvertiserCampaigns';
import { CampaignCard } from './CampaignCard';
import { CampaignEmpty } from './CampaignEmpty';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CAMPAIGN_STATUS_LABELS } from '@/features/campaign/constants/campaign-status';

export function AdvertiserCampaignList() {
  const [status, setStatus] = useState<'recruiting' | 'closed' | 'selected'>('recruiting');
  const [sort, setSort] = useState<'latest' | 'deadline'>('latest');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAdvertiserCampaigns({
    status,
    sort,
    page,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-red-500">
          {error instanceof Error ? error.message : '체험단 목록을 불러오는데 실패했습니다.'}
        </p>
        <Button onClick={() => refetch()}>다시 시도</Button>
      </div>
    );
  }

  if (!data || data.campaigns.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recruiting">{CAMPAIGN_STATUS_LABELS.recruiting}</SelectItem>
              <SelectItem value="closed">{CAMPAIGN_STATUS_LABELS.closed}</SelectItem>
              <SelectItem value="selected">{CAMPAIGN_STATUS_LABELS.selected}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="deadline">마감임박순</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CampaignEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recruiting">{CAMPAIGN_STATUS_LABELS.recruiting}</SelectItem>
            <SelectItem value="closed">{CAMPAIGN_STATUS_LABELS.closed}</SelectItem>
            <SelectItem value="selected">{CAMPAIGN_STATUS_LABELS.selected}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="deadline">마감임박순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} baseUrl="/advertiser/campaigns" />
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPrevPage}
          >
            이전
          </Button>
          <span className="text-sm text-slate-600">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.pagination.hasNextPage}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
