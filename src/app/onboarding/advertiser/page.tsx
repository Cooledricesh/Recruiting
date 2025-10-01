"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

type AdvertiserOnboardingPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AdvertiserOnboardingPage({ params }: AdvertiserOnboardingPageProps) {
  void params;
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          광고주 정보 등록
        </h1>
        <p className="text-sm text-slate-500">
          체험단을 운영하기 위한 업체 정보를 등록해주세요.
        </p>

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            이 페이지는 아직 구현되지 않았습니다.
            광고주 정보 등록 기능은 다음 단계에서 구현될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}