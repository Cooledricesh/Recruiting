"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdvertiserProfileForm } from '@/features/advertiser/components/AdvertiserProfileForm';
import { useAdvertiserProfile } from '@/features/advertiser/hooks/useAdvertiserProfile';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export default function AdvertiserProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const { profile, isLoading: profileLoading } = useAdvertiserProfile();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  if (userLoading || profileLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <AdvertiserProfileForm
          initialData={profile}
          onSuccess={() => {
            router.push('/advertiser/campaigns');
          }}
        />
      </div>
    </div>
  );
}
