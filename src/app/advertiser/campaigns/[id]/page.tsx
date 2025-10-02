'use client';

import { use } from 'react';
import { AdvertiserCampaignDetail } from '@/features/campaign/components/AdvertiserCampaignDetail';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdvertiserCampaignDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="container mx-auto py-8 px-4">
      <AdvertiserCampaignDetail campaignId={id} />
    </div>
  );
}
