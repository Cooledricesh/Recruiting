import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  calculateDaysRemaining,
  isDeadlineSoon,
} from '@/lib/date-utils';
import { calculateOffset, calculatePagination } from '@/lib/pagination';
import {
  CampaignListResponseSchema,
  CampaignResponseSchema,
  CampaignTableRowSchema,
  type CampaignListQuery,
  type CampaignListResponse,
  type CampaignResponse,
  type CampaignTableRow,
} from './schema';
import {
  campaignErrorCodes,
  type CampaignServiceError,
} from './error';

const CAMPAIGNS_TABLE = 'campaigns';

export const getCampaignList = async (
  client: SupabaseClient,
  filters: CampaignListQuery
): Promise<
  HandlerResult<CampaignListResponse, CampaignServiceError, unknown>
> => {
  const { category, status, sort, page, limit } = filters;
  const offset = calculateOffset(page, limit);

  let query = client
    .from(CAMPAIGNS_TABLE)
    .select(
      `
      id,
      title,
      recruitment_start,
      recruitment_end,
      recruitment_count,
      benefits,
      status,
      created_at,
      advertiser_profiles!inner(
        company_name,
        location,
        category
      )
    `,
      { count: 'exact' }
    )
    .eq('status', status);

  if (category) {
    query = query.eq('advertiser_profiles.category', category);
  }

  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'deadline') {
    query = query.order('recruitment_end', { ascending: true });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return failure(500, campaignErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(
      404,
      campaignErrorCodes.fetchError,
      'No campaigns found'
    );
  }

  const mappedCampaigns: CampaignResponse[] = [];

  for (const row of data) {
    const rowParse = CampaignTableRowSchema.safeParse(row);

    if (!rowParse.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        'Campaign row failed validation',
        rowParse.error.format()
      );
    }

    const validRow: CampaignTableRow = rowParse.data;

    const daysRemaining = calculateDaysRemaining(
      validRow.recruitment_end
    );

    const mapped: CampaignResponse = {
      id: validRow.id,
      title: validRow.title,
      recruitmentStart: validRow.recruitment_start,
      recruitmentEnd: validRow.recruitment_end,
      recruitmentCount: validRow.recruitment_count,
      benefits: validRow.benefits,
      status: validRow.status as 'recruiting' | 'closed' | 'selected',
      category: validRow.advertiser_profiles.category,
      companyName: validRow.advertiser_profiles.company_name,
      location: validRow.advertiser_profiles.location,
      createdAt: validRow.created_at,
      daysRemaining,
      isDeadlineSoon: isDeadlineSoon(validRow.recruitment_end),
    };

    const campaignParse = CampaignResponseSchema.safeParse(mapped);

    if (!campaignParse.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        'Campaign response failed validation',
        campaignParse.error.format()
      );
    }

    mappedCampaigns.push(campaignParse.data);
  }

  const pagination = calculatePagination(page, limit, count ?? 0);

  const response: CampaignListResponse = {
    campaigns: mappedCampaigns,
    pagination,
  };

  const responseParse = CampaignListResponseSchema.safeParse(response);

  if (!responseParse.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      'Campaign list response failed validation',
      responseParse.error.format()
    );
  }

  return success(responseParse.data);
};
