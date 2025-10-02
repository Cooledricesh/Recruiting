'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdvertiserCampaignDetail } from '@/features/campaign/hooks/useAdvertiserCampaignDetail';
import { CloseCampaignDialog } from './CloseCampaignDialog';
import { ApplicantsTable } from './ApplicantsTable';

type Props = {
  campaignId: string;
};

export const AdvertiserCampaignDetail = ({ campaignId }: Props) => {
  const { data: campaign, isLoading, error } = useAdvertiserCampaignDetail(campaignId);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-destructive">체험단 정보를 불러오는데 실패했습니다</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
          </p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        체험단 정보를 찾을 수 없습니다
      </div>
    );
  }

  const getStatusBadge = (status: 'recruiting' | 'closed' | 'selected') => {
    switch (status) {
      case 'recruiting':
        return <Badge className="bg-green-500">모집중</Badge>;
      case 'closed':
        return <Badge className="bg-yellow-500">모집종료</Badge>;
      case 'selected':
        return <Badge className="bg-blue-500">선정완료</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-8">
        <Link href="/advertiser/campaigns">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-muted-foreground">
              {campaign.companyName} · {campaign.category} · {campaign.location}
            </p>
          </div>
          {campaign.status === 'recruiting' && (
            <Button
              variant="destructive"
              onClick={() => setCloseDialogOpen(true)}
            >
              모집종료
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">모집 기간</h3>
            <p className="text-sm">
              {format(new Date(campaign.recruitmentStart), 'yyyy년 MM월 dd일', { locale: ko })} -{' '}
              {format(new Date(campaign.recruitmentEnd), 'yyyy년 MM월 dd일', { locale: ko })}
            </p>
            {campaign.daysRemaining !== undefined && campaign.daysRemaining >= 0 && (
              <p className="text-sm text-muted-foreground">
                {campaign.isDeadlineSoon && <span className="text-destructive">⚠️ </span>}
                D-{campaign.daysRemaining}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">모집 인원</h3>
            <p className="text-sm">
              {campaign.recruitmentCount}명 (현재 지원자 {campaign.applicantCount}명)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">제공 혜택</h3>
          <p className="text-sm whitespace-pre-wrap">{campaign.benefits}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">미션 내용</h3>
          <p className="text-sm whitespace-pre-wrap">{campaign.mission}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">매장 정보</h3>
          <p className="text-sm whitespace-pre-wrap">{campaign.storeInfo}</p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">지원자 목록</h2>
          <ApplicantsTable
            applicants={campaign.applicants}
            campaignStatus={campaign.status}
            campaignId={campaign.id}
            recruitmentCount={campaign.recruitmentCount}
          />
        </div>
      </div>

      <CloseCampaignDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
      />
    </>
  );
};
