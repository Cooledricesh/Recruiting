import { z } from 'zod';

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
