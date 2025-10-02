"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CampaignList } from "@/features/campaign/components/CampaignList";
import { CampaignFilter } from "@/features/campaign/components/CampaignFilter";
import { CampaignSort } from "@/features/campaign/components/CampaignSort";
import type { CampaignListQuery } from "@/features/campaign/lib/dto";

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const router = useRouter();

  const [filters, setFilters] = useState<CampaignListQuery>({
    status: "recruiting",
    sort: "latest",
    page: 1,
    limit: 20,
  });

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace("/");
  }, [refresh, router]);

  const handleSortChange = useCallback(
    (sort: "latest" | "deadline") => {
      setFilters((prev) => ({
        ...prev,
        sort,
        page: 1,
      }));
    },
    []
  );

  const authActions = useMemo(() => {
    if (isLoading) {
      return (
        <span className="text-sm text-slate-300">세션 확인 중...</span>
      );
    }

    if (isAuthenticated && user) {
      const userRole = user.userMetadata?.role as string | undefined;

      return (
        <div className="flex items-center gap-3 text-sm">
          <span className="truncate text-slate-700 dark:text-slate-300">{user.email ?? "알 수 없는 사용자"}</span>
          <div className="flex items-center gap-2">
            {userRole === "influencer" && (
              <>
                <Link
                  href="/my/applications"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  내 지원 목록
                </Link>
                <Link
                  href="/onboarding/influencer"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  채널 관리
                </Link>
              </>
            )}
            {userRole === "advertiser" && (
              <>
                <Link
                  href="/advertiser/campaigns"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  체험단 관리
                </Link>
                <Link
                  href="/advertiser/profile"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  광고주 정보 관리
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
        >
          회원가입
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            체험단 모집 플랫폼
          </div>
          {authActions}
        </div>

        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
            체험단 둘러보기
          </h1>
          <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
            다양한 체험단 기회를 탐색하고, 원하는 체험단에 지원해보세요
          </p>
        </header>

        <section className="space-y-6 rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CampaignFilter filters={filters} onChange={setFilters} />
            <CampaignSort sort={filters.sort ?? "latest"} onChange={handleSortChange} />
          </div>

          <CampaignList filters={filters} onFilterChange={setFilters} />
        </section>
      </div>
    </main>
  );
}
