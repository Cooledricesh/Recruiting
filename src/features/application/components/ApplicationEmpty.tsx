"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus } from "@/features/application/lib/dto";

type ApplicationEmptyProps = {
  currentStatus?: ApplicationStatus;
};

const getEmptyMessage = (status: ApplicationStatus): string => {
  const messages = {
    applied: "신청완료 상태의 지원 내역이 없습니다",
    selected: "선정된 지원 내역이 없습니다",
    rejected: "반려된 지원 내역이 없습니다",
  };
  return messages[status];
};

export function ApplicationEmpty({ currentStatus }: ApplicationEmptyProps) {
  const message = currentStatus
    ? getEmptyMessage(currentStatus)
    : "아직 지원한 체험단이 없습니다";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">📋</div>
      <h3 className="mb-2 text-lg font-semibold">{message}</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        체험단에 지원하고 다양한 혜택을 받아보세요
      </p>
      <Link href="/">
        <Button>체험단 둘러보기</Button>
      </Link>
    </div>
  );
}
