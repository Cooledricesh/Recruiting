import { z } from 'zod';
import { isFutureDate, isAfterDate } from '@/lib/validation-utils';

export const CampaignStatusSchema = z.enum(['recruiting', 'closed', 'selected']);
export const CampaignSortSchema = z.enum(['latest', 'deadline']);

export const CampaignListQuerySchema = z.object({
  category: z.string().optional(),
  status: CampaignStatusSchema.optional().default('recruiting'),
  sort: CampaignSortSchema.optional().default('latest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

export const CampaignResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  recruitmentStart: z.string(),
  recruitmentEnd: z.string(),
  recruitmentCount: z.number().int().positive(),
  benefits: z.string(),
  status: CampaignStatusSchema,
  category: z.string(),
  companyName: z.string(),
  location: z.string(),
  createdAt: z.string(),
  daysRemaining: z.number().int().optional(),
  isDeadlineSoon: z.boolean(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignResponseSchema),
  pagination: PaginationSchema,
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

export const CampaignTableRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  recruitment_start: z.string(),
  recruitment_end: z.string(),
  recruitment_count: z.number(),
  benefits: z.string(),
  status: z.string(),
  created_at: z.string(),
  advertiser_profiles: z.object({
    company_name: z.string(),
    location: z.string(),
    category: z.string(),
  }),
});

export type CampaignTableRow = z.infer<typeof CampaignTableRowSchema>;

export const CampaignDetailTableRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  recruitment_start: z.string(),
  recruitment_end: z.string(),
  recruitment_count: z.number(),
  benefits: z.string(),
  mission: z.string(),
  store_info: z.string(),
  status: z.string(),
  created_at: z.string(),
  advertiser_profiles: z.object({
    id: z.string().uuid(),
    company_name: z.string(),
    location: z.string(),
    category: z.string(),
    store_phone: z.string(),
  }),
});

export type CampaignDetailTableRow = z.infer<
  typeof CampaignDetailTableRowSchema
>;

export const CampaignDetailResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  recruitmentStart: z.string(),
  recruitmentEnd: z.string(),
  recruitmentCount: z.number().int().positive(),
  benefits: z.string(),
  mission: z.string(),
  storeInfo: z.string(),
  status: CampaignStatusSchema,
  category: z.string(),
  companyName: z.string(),
  location: z.string(),
  createdAt: z.string(),
  daysRemaining: z.number().int().optional(),
  isDeadlineSoon: z.boolean(),
  hasApplied: z.boolean(),
  hasInfluencerProfile: z.boolean(),
  advertiser: z.object({
    id: z.string().uuid(),
    companyName: z.string(),
    location: z.string(),
    category: z.string(),
    storePhone: z.string(),
  }),
});

export type CampaignDetailResponse = z.infer<
  typeof CampaignDetailResponseSchema
>;

// Application schemas
export const ApplicationRequestSchema = z.object({
  message: z
    .string()
    .min(10, '각오 한마디는 최소 10자 이상 입력해야 합니다')
    .max(500, '각오 한마디는 최대 500자까지 입력 가능합니다'),
  visitDate: z
    .string()
    .refine((date) => isFutureDate(date), {
      message: '방문 예정일은 오늘 이후 날짜만 선택 가능합니다',
    }),
});

export type ApplicationRequest = z.infer<typeof ApplicationRequestSchema>;

export const ApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  influencerId: z.string().uuid(),
  message: z.string(),
  visitDate: z.string(),
  status: z.literal('applied'),
  createdAt: z.string(),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

// 체험단 생성 요청 스키마
export const CreateCampaignRequestSchema = z.object({
  title: z.string().min(5, '제목은 최소 5자 이상이어야 합니다').max(100, '제목은 최대 100자까지 입력 가능합니다'),
  recruitmentStart: z.string().refine(isFutureDate, {
    message: '모집 시작일은 오늘 이후여야 합니다',
  }),
  recruitmentEnd: z.string(),
  recruitmentCount: z.coerce.number().int().positive('모집 인원은 1명 이상이어야 합니다'),
  benefits: z.string().min(10, '제공 혜택은 최소 10자 이상이어야 합니다'),
  mission: z.string().min(10, '미션 내용은 최소 10자 이상이어야 합니다'),
  storeInfo: z.string().min(5, '매장 정보는 최소 5자 이상이어야 합니다'),
}).refine(
  (data) => isAfterDate(data.recruitmentEnd, data.recruitmentStart),
  {
    message: '모집 종료일은 시작일 이후여야 합니다',
    path: ['recruitmentEnd'],
  }
);

export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>;

// 광고주 체험단 목록 응답
export const AdvertiserCampaignResponseSchema = CampaignResponseSchema.extend({
  applicantCount: z.number().int().nonnegative().optional().default(0),
});

export type AdvertiserCampaignResponse = z.infer<typeof AdvertiserCampaignResponseSchema>;

export const AdvertiserCampaignListResponseSchema = z.object({
  campaigns: z.array(AdvertiserCampaignResponseSchema),
  pagination: PaginationSchema,
});

export type AdvertiserCampaignListResponse = z.infer<typeof AdvertiserCampaignListResponseSchema>;
