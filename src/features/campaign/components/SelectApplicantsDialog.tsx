'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSelectApplicants } from '@/features/campaign/hooks/useSelectApplicants';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  selectedIds: string[];
  recruitmentCount: number;
};

export const SelectApplicantsDialog = ({
  open,
  onOpenChange,
  campaignId,
  selectedIds,
  recruitmentCount,
}: Props) => {
  const selectApplicants = useSelectApplicants();
  const [isSelecting, setIsSelecting] = useState(false);

  const isOverRecruited = selectedIds.length > recruitmentCount;
  const isUnderRecruited = selectedIds.length < recruitmentCount;

  const handleSelect = async () => {
    if (selectedIds.length === 0) {
      toast.error('최소 1명 이상 선택해주세요');
      return;
    }

    setIsSelecting(true);
    try {
      const result = await selectApplicants.mutateAsync({
        campaignId,
        selectedIds,
      });
      toast.success(
        `선정이 완료되었습니다 (선정 ${result.selectedCount}명, 반려 ${result.rejectedCount}명)`
      );
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '선정 처리에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>체험단 선정</DialogTitle>
          <DialogDescription>
            선택한 지원자를 체험단으로 선정하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <p className="text-sm">
            모집 인원: <span className="font-semibold">{recruitmentCount}명</span>
          </p>
          <p className="text-sm">
            선택 인원: <span className="font-semibold">{selectedIds.length}명</span>
          </p>
          {isOverRecruited && (
            <p className="text-sm text-destructive">
              ⚠️ 모집 인원을 초과했습니다
            </p>
          )}
          {isUnderRecruited && (
            <p className="text-sm text-amber-600">
              ⚠️ 선정 인원이 부족합니다. 계속하시겠습니까?
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSelecting}
          >
            취소
          </Button>
          <Button
            onClick={handleSelect}
            disabled={isSelecting || isOverRecruited}
          >
            {isSelecting ? '처리중...' : '선정 완료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
