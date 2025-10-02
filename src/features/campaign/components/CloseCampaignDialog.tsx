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
import { useCloseCampaign } from '@/features/campaign/hooks/useCloseCampaign';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignTitle: string;
};

export const CloseCampaignDialog = ({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
}: Props) => {
  const closeCampaign = useCloseCampaign();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    setIsClosing(true);
    try {
      await closeCampaign.mutateAsync(campaignId);
      toast.success('모집이 종료되었습니다');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '모집종료에 실패했습니다';
      toast.error(message);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>모집 종료</DialogTitle>
          <DialogDescription>
            &quot;{campaignTitle}&quot; 체험단의 모집을 종료하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-destructive">
            ⚠️ 모집종료는 되돌릴 수 없습니다
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClosing}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleClose}
            disabled={isClosing}
          >
            {isClosing ? '처리중...' : '모집종료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
