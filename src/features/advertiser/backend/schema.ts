import { z } from 'zod';
import { BUSINESS_CATEGORIES } from '@/constants/business-categories';
import { parseBusinessNumber, isValidBusinessNumber } from '@/lib/validation/business-number';

const categoryValues = BUSINESS_CATEGORIES.map(cat => cat.value) as [string, ...string[]];

export const businessNumberSchema = z
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
  );

const storePhoneSchema = z
  .string()
  .min(1, '업장 전화번호를 입력해주세요')
  .regex(
    /^(0[0-9]{1,2})-?([0-9]{3,4})-?([0-9]{4})$/,
    '올바른 전화번호 형식이 아닙니다'
  );

export const createProfileRequestSchema = z.object({
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
  storePhone: storePhoneSchema,
  category: z.enum(categoryValues, {
    errorMap: () => ({ message: '카테고리를 선택해주세요' }),
  }),
  businessNumber: businessNumberSchema,
  representativeName: z
    .string()
    .min(1, '대표자명을 입력해주세요')
    .max(100, '대표자명은 100자 이내여야 합니다'),
});

export const profileResponseSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  companyName: z.string(),
  address: z.string(),
  location: z.string(),
  storePhone: z.string(),
  category: z.string(),
  businessNumber: z.string(),
  representativeName: z.string(),
  isVerified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const businessNumberParamSchema = z.object({
  businessNumber: z.string().min(10, '유효한 사업자번호가 아닙니다'),
});

export const businessNumberDuplicateResponseSchema = z.object({
  isDuplicate: z.boolean(),
});

export type CreateProfileRequest = z.infer<typeof createProfileRequestSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type BusinessNumberParam = z.infer<typeof businessNumberParamSchema>;
export type BusinessNumberDuplicateResponse = z.infer<typeof businessNumberDuplicateResponseSchema>;
