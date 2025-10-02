import { z } from 'zod';
import { CampaignStatusSchema } from '@/features/campaign/backend/schema';

export const ApplicationStatusSchema = z.enum(['applied', 'selected', 'rejected']);

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const MyApplicationsQuerySchema = z.object({
  status: ApplicationStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export type MyApplicationsQuery = z.infer<typeof MyApplicationsQuerySchema>;

export const ApplicationTableRowSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  message: z.string(),
  visit_date: z.string(),
  status: ApplicationStatusSchema,
  created_at: z.string(),
  campaigns: z.object({
    id: z.string().uuid(),
    title: z.string(),
    recruitment_end: z.string(),
    status: z.string(),
    advertiser_profiles: z.object({
      company_name: z.string(),
      location: z.string(),
      category: z.string(),
    }),
  }).nullable(),
});

export type ApplicationTableRow = z.infer<typeof ApplicationTableRowSchema>;

export const MyApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  visitDate: z.string(),
  status: ApplicationStatusSchema,
  appliedAt: z.string(),
  campaign: z.object({
    id: z.string().uuid(),
    title: z.string(),
    companyName: z.string(),
    location: z.string(),
    category: z.string(),
    recruitmentEnd: z.string(),
    status: CampaignStatusSchema,
    isDeleted: z.boolean(),
  }),
});

export type MyApplicationResponse = z.infer<typeof MyApplicationResponseSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const MyApplicationsResponseSchema = z.object({
  applications: z.array(MyApplicationResponseSchema),
  pagination: PaginationSchema,
});

export type MyApplicationsResponse = z.infer<typeof MyApplicationsResponseSchema>;
