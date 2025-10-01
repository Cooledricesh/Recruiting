"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { SignupForm } from "@/features/auth/components/signup/SignupForm";

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/dashboard";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">회원가입</h1>
        <p className="text-slate-500">
          체험단 플랫폼에 가입하고 새로운 기회를 만나보세요
        </p>
      </header>

      <div className="grid w-full gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <SignupForm />
          </div>
        </div>

        <div className="order-1 flex flex-col justify-center gap-6 lg:order-2">
          <figure className="overflow-hidden rounded-xl border border-slate-200">
            <Image
              src="https://picsum.photos/seed/signup/640/480"
              alt="회원가입"
              width={640}
              height={480}
              className="h-full w-full object-cover"
              priority
            />
          </figure>

          <div className="space-y-4 rounded-xl bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              회원가입 혜택
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="font-medium text-slate-900">광고주</strong>는 효과적인 체험단 운영 도구를 무료로 이용할 수 있습니다
                </span>
              </li>
              <li className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="font-medium text-slate-900">인플루언서</strong>는 다양한 체험단 기회를 쉽게 찾을 수 있습니다
                </span>
              </li>
              <li className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>안전한 거래와 투명한 선정 프로세스</span>
              </li>
              <li className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>실시간 알림과 편리한 관리 도구</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
