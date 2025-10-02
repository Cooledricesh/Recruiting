"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BUSINESS_CATEGORY_OPTIONS } from '@/constants/business-categories';
import {
  handleBusinessNumberInput,
  parseBusinessNumber,
  isValidBusinessNumber,
  formatBusinessNumber
} from '@/lib/validation/business-number';
import { handleStorePhoneInput } from '@/lib/validation/phone';
import { useAdvertiserProfile } from '../hooks/useAdvertiserProfile';
import { AddressSearch } from './AddressSearch';
import type { ProfileResponse } from '../lib/dto';

const formSchema = z.object({
  companyName: z
    .string()
    .min(1, '업체명을 입력해주세요')
    .max(200, '업체명은 200자 이내여야 합니다'),
  address: z
    .string()
    .min(1, '주소를 입력해주세요')
    .max(500, '주소는 500자 이내여야 합니다'),
  location: z
    .string()
    .min(1, '위치를 입력해주세요')
    .max(500, '위치는 500자 이내여야 합니다'),
  storePhone: z
    .string()
    .min(1, '업장 전화번호를 입력해주세요')
    .regex(
      /^(0[0-9]{1,2})-?([0-9]{3,4})-?([0-9]{4})$/,
      '올바른 전화번호 형식이 아닙니다'
    ),
  category: z
    .string()
    .min(1, '카테고리를 선택해주세요'),
  businessNumber: z
    .string()
    .min(1, '사업자등록번호를 입력해주세요')
    .transform(parseBusinessNumber)
    .refine(
      (val) => val.length === 10,
      '사업자등록번호는 10자리 숫자여야 합니다'
    )
    .refine(
      (val) => isValidBusinessNumber(val),
      '유효하지 않은 사업자등록번호입니다'
    ),
  representativeName: z
    .string()
    .min(1, '대표자명을 입력해주세요')
    .max(100, '대표자명은 100자 이내여야 합니다'),
});

type FormData = z.infer<typeof formSchema>;

interface AdvertiserProfileFormProps {
  initialData?: ProfileResponse | null;
  onSuccess?: () => void;
}

export function AdvertiserProfileForm({ initialData, onSuccess }: AdvertiserProfileFormProps) {
  const { createOrUpdateProfile, isCreatingOrUpdating, checkBusinessNumberDuplicate } =
    useAdvertiserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          companyName: initialData.companyName,
          address: initialData.address,
          location: initialData.location,
          storePhone: initialData.storePhone,
          category: initialData.category,
          businessNumber: formatBusinessNumber(initialData.businessNumber),
          representativeName: initialData.representativeName,
        }
      : undefined,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        companyName: initialData.companyName,
        address: initialData.address,
        location: initialData.location,
        storePhone: initialData.storePhone,
        category: initialData.category,
        businessNumber: formatBusinessNumber(initialData.businessNumber),
        representativeName: initialData.representativeName,
      });
    }
  }, [initialData, reset]);

  const businessNumber = watch('businessNumber');
  const storePhone = watch('storePhone');
  const category = watch('category');

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleBusinessNumberInput(e.target.value);
    setValue('businessNumber', formatted, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleStorePhoneInput(e.target.value);
    setValue('storePhone', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    const isDuplicate = await checkBusinessNumberDuplicate(
      parseBusinessNumber(data.businessNumber),
      initialData?.userId
    );

    if (isDuplicate) {
      setError('businessNumber', {
        type: 'manual',
        message: '이미 등록된 사업자번호입니다',
      });
      return;
    }

    createOrUpdateProfile(
      {
        companyName: data.companyName,
        address: data.address,
        location: data.location,
        storePhone: data.storePhone,
        category: data.category,
        businessNumber: parseBusinessNumber(data.businessNumber),
        representativeName: data.representativeName,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const handleAddressSelect = (address: string, zonecode: string) => {
    setValue('address', `(${zonecode}) ${address}`, { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>광고주 정보 등록</CardTitle>
        <CardDescription>
          체험단을 등록하기 위해 광고주 정보를 입력해주세요.
          사업자번호는 검증 후 승인됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              업체명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              {...register('companyName')}
              placeholder="업체명을 입력해주세요"
              disabled={isCreatingOrUpdating}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              주소 <span className="text-red-500">*</span>
            </Label>
            <AddressSearch
              onSelect={handleAddressSelect}
              disabled={isCreatingOrUpdating}
            />
            <Input
              id="address"
              {...register('address')}
              placeholder="주소 검색 버튼을 클릭해주세요"
              disabled={isCreatingOrUpdating}
              readOnly
              className="w-full"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              위치 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="예: 강남역 3번 출구"
              disabled={isCreatingOrUpdating}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
            <p className="text-xs text-gray-500">
              고객이 쉽게 찾을 수 있도록 구체적인 위치를 입력해주세요
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storePhone">
              업장 전화번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="storePhone"
              value={storePhone || ''}
              onChange={handlePhoneChange}
              placeholder="02-1234-5678"
              disabled={isCreatingOrUpdating}
            />
            {errors.storePhone && (
              <p className="text-sm text-red-500">{errors.storePhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setValue('category', value, { shouldValidate: true })}
              disabled={isCreatingOrUpdating}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessNumber">
              사업자등록번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessNumber"
              value={businessNumber || ''}
              onChange={handleBusinessNumberChange}
              placeholder="123-45-67890"
              disabled={isCreatingOrUpdating}
              maxLength={12}
            />
            {errors.businessNumber && (
              <p className="text-sm text-red-500">{errors.businessNumber.message}</p>
            )}
            <p className="text-xs text-gray-500">
              하이픈 포함 10자리 숫자를 입력해주세요. 검증까지 최대 1영업일 소요됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="representativeName">
              대표자명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="representativeName"
              {...register('representativeName')}
              placeholder="홍길동"
              disabled={isCreatingOrUpdating}
            />
            {errors.representativeName && (
              <p className="text-sm text-red-500">{errors.representativeName.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isCreatingOrUpdating}
            className="w-full"
          >
            {isCreatingOrUpdating ? '저장 중...' : '저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
