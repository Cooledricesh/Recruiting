"use client";

import { use } from "react";
import { CampaignDetail } from "@/features/campaign/components/CampaignDetail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function CampaignDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <CampaignDetail campaignId={id} />
    </main>
  );
}
