'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdvertiserCampaignList } from '@/features/campaign/components/AdvertiserCampaignList';
import { CreateCampaignDialog } from '@/features/campaign/components/CreateCampaignDialog';

export default function AdvertiserCampaignsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            체험단 관리
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            등록한 체험단을 관리하고 신규 체험단을 등록하세요.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          신규 등록
        </Button>
      </div>

      <AdvertiserCampaignList />

      <CreateCampaignDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
