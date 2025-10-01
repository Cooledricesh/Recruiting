"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

type VerifyEmailPageProps = {
  params: Promise<Record<string, never>>;
};

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  void params;
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">
            이메일을 확인해주세요
          </h1>
          <p className="text-sm text-slate-500">
            가입하신 이메일로 인증 링크를 발송했습니다.
            <br />
            이메일을 확인하여 가입을 완료해주세요.
          </p>
        </div>

        <div className="space-y-4 rounded-lg bg-slate-50 p-4">
          <h2 className="text-sm font-medium text-slate-900">
            다음 단계
          </h2>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex">
              <span className="mr-2 font-medium">1.</span>
              <span>가입하신 이메일의 받은편지함을 확인하세요</span>
            </li>
            <li className="flex">
              <span className="mr-2 font-medium">2.</span>
              <span>&ldquo;이메일 인증하기&rdquo; 버튼을 클릭하세요</span>
            </li>
            <li className="flex">
              <span className="mr-2 font-medium">3.</span>
              <span>역할에 맞는 추가 정보를 입력하세요</span>
            </li>
          </ol>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-500">
            이메일을 받지 못하셨나요?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: 재발송 기능 구현
                alert('이메일 재발송 기능은 준비 중입니다');
              }}
            >
              재발송
            </Button>
            <Link href="/login" className="flex-1">
              <Button variant="default" className="w-full">
                로그인으로 이동
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          스팸 메일함도 확인해주세요.
          <br />
          문제가 계속되면 고객센터로 문의해주세요.
        </p>
      </div>
    </div>
  );
}