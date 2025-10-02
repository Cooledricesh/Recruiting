'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateCampaignForm } from './CreateCampaignForm';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>신규 체험단 등록</DialogTitle>
          <DialogDescription>
            체험단 정보를 입력하고 인플루언서 모집을 시작하세요.
          </DialogDescription>
        </DialogHeader>
        <CreateCampaignForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
