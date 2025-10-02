'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useCreateCampaign } from '@/features/campaign/hooks/useCreateCampaign';
import { CreateCampaignRequestSchema, type CreateCampaignRequest } from '@/features/campaign/lib/dto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { extractApiErrorMessage } from '@/lib/remote/api-client';
import { useToast } from '@/hooks/use-toast';

interface CreateCampaignFormProps {
  onSuccess?: () => void;
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  const { toast } = useToast();
  const createCampaignMutation = useCreateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCampaignRequest>({
    resolver: zodResolver(CreateCampaignRequestSchema),
    defaultValues: {
      title: '',
      recruitmentStart: '',
      recruitmentEnd: '',
      recruitmentCount: 1,
      benefits: '',
      mission: '',
      storeInfo: '',
    },
  });

  const onSubmit = async (data: CreateCampaignRequest) => {
    try {
      await createCampaignMutation.mutateAsync(data);
      toast({
        title: '체험단 등록 완료',
        description: '체험단이 성공적으로 등록되었습니다.',
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '체험단 등록 실패',
        description: extractApiErrorMessage(error, '체험단 등록에 실패했습니다.'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">체험단 제목 *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="체험단 제목을 입력하세요 (최소 5자)"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recruitmentStart">모집 시작일 *</Label>
          <Input
            id="recruitmentStart"
            type="date"
            {...register('recruitmentStart')}
            min={format(new Date(), 'yyyy-MM-dd')}
            disabled={isSubmitting}
          />
          {errors.recruitmentStart && (
            <p className="text-sm text-red-500">{errors.recruitmentStart.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recruitmentEnd">모집 종료일 *</Label>
          <Input
            id="recruitmentEnd"
            type="date"
            {...register('recruitmentEnd')}
            min={format(new Date(), 'yyyy-MM-dd')}
            disabled={isSubmitting}
          />
          {errors.recruitmentEnd && (
            <p className="text-sm text-red-500">{errors.recruitmentEnd.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recruitmentCount">모집 인원 *</Label>
        <Input
          id="recruitmentCount"
          type="number"
          {...register('recruitmentCount', { valueAsNumber: true })}
          placeholder="모집 인원을 입력하세요"
          min={1}
          disabled={isSubmitting}
        />
        {errors.recruitmentCount && (
          <p className="text-sm text-red-500">{errors.recruitmentCount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">제공 혜택 *</Label>
        <Textarea
          id="benefits"
          {...register('benefits')}
          placeholder="제공하는 혜택을 입력하세요 (최소 10자)"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.benefits && (
          <p className="text-sm text-red-500">{errors.benefits.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mission">미션 내용 *</Label>
        <Textarea
          id="mission"
          {...register('mission')}
          placeholder="인플루언서가 수행할 미션을 입력하세요 (최소 10자)"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.mission && (
          <p className="text-sm text-red-500">{errors.mission.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeInfo">매장 정보 *</Label>
        <Textarea
          id="storeInfo"
          {...register('storeInfo')}
          placeholder="매장 위치, 영업시간 등의 정보를 입력하세요 (최소 5자)"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.storeInfo && (
          <p className="text-sm text-red-500">{errors.storeInfo.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '등록하기'}
        </Button>
      </div>
    </form>
  );
}
