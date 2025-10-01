"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type CampaignEmptyProps = {
  onReset?: () => void;
};

export function CampaignEmpty({ onReset }: CampaignEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="mb-4 h-16 w-16 text-slate-400" />
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        현재 모집 중인 체험단이 없습니다
      </h3>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        다른 필터 조건으로 검색해보세요
      </p>
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          필터 초기화
        </Button>
      )}
    </div>
  );
}
