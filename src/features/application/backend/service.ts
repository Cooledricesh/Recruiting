import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import { calculateOffset, calculatePagination } from '@/lib/pagination';
import {
  MyApplicationsQuerySchema,
  MyApplicationsResponseSchema,
  ApplicationTableRowSchema,
  MyApplicationResponseSchema,
  type MyApplicationsQuery,
  type MyApplicationsResponse,
  type ApplicationTableRow,
  type MyApplicationResponse,
} from './schema';
import {
  applicationErrorCodes,
  type ApplicationServiceError,
} from './error';

const APPLICATIONS_TABLE = 'applications';
const INFLUENCER_PROFILES_TABLE = 'influencer_profiles';

export const getMyApplications = async (
  client: SupabaseClient,
  userId: string,
  filters: MyApplicationsQuery
): Promise<
  HandlerResult<MyApplicationsResponse, ApplicationServiceError, unknown>
> => {
  const { status, page, limit } = filters;
  const offset = calculateOffset(page, limit);

  const { data: influencerProfile, error: profileError } = await client
    .from(INFLUENCER_PROFILES_TABLE)
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profileError || !influencerProfile) {
    return failure(
      404,
      applicationErrorCodes.influencerNotFound,
      '인플루언서 프로필을 찾을 수 없습니다'
    );
  }

  let query = client
    .from(APPLICATIONS_TABLE)
    .select(
      `
      id,
      campaign_id,
      message,
      visit_date,
      status,
      created_at,
      campaigns (
        id,
        title,
        recruitment_end,
        status,
        advertiser_profiles (
          company_name,
          location,
          category
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('influencer_id', influencerProfile.id);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return failure(500, applicationErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(
      404,
      applicationErrorCodes.fetchError,
      'No applications found'
    );
  }

  const mappedApplications: MyApplicationResponse[] = [];

  for (const row of data) {
    const rowParse = ApplicationTableRowSchema.safeParse(row);

    if (!rowParse.success) {
      return failure(
        500,
        applicationErrorCodes.fetchError,
        'Application row failed validation',
        rowParse.error.format()
      );
    }

    const validRow: ApplicationTableRow = rowParse.data;

    const isDeleted = validRow.campaigns === null;

    const mapped: MyApplicationResponse = {
      id: validRow.id,
      message: validRow.message,
      visitDate: validRow.visit_date,
      status: validRow.status,
      appliedAt: validRow.created_at,
      campaign: {
        id: isDeleted ? validRow.campaign_id : validRow.campaigns!.id,
        title: isDeleted ? '삭제된 체험단' : validRow.campaigns!.title,
        companyName: isDeleted ? '-' : validRow.campaigns!.advertiser_profiles.company_name,
        location: isDeleted ? '-' : validRow.campaigns!.advertiser_profiles.location,
        category: isDeleted ? '-' : validRow.campaigns!.advertiser_profiles.category,
        recruitmentEnd: isDeleted ? '' : validRow.campaigns!.recruitment_end,
        status: isDeleted ? 'closed' : (validRow.campaigns!.status as 'recruiting' | 'closed' | 'selected'),
        isDeleted,
      },
    };

    const applicationParse = MyApplicationResponseSchema.safeParse(mapped);

    if (!applicationParse.success) {
      return failure(
        500,
        applicationErrorCodes.fetchError,
        'Application response failed validation',
        applicationParse.error.format()
      );
    }

    mappedApplications.push(applicationParse.data);
  }

  const pagination = calculatePagination(page, limit, count ?? 0);

  const response: MyApplicationsResponse = {
    applications: mappedApplications,
    pagination,
  };

  const responseParse = MyApplicationsResponseSchema.safeParse(response);

  if (!responseParse.success) {
    return failure(
      500,
      applicationErrorCodes.fetchError,
      'Applications response failed validation',
      responseParse.error.format()
    );
  }

  return success(responseParse.data);
};
