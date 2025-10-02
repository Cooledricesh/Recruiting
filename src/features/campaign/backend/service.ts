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
import { isAfterDate, isFutureDate } from '@/lib/validation-utils';
import { calculateOffset, calculatePagination } from '@/lib/pagination';
import {
  CampaignListResponseSchema,
  CampaignResponseSchema,
  CampaignTableRowSchema,
  CampaignDetailTableRowSchema,
  CampaignDetailResponseSchema,
  ApplicationResponseSchema,
  CreateCampaignRequestSchema,
  AdvertiserCampaignResponseSchema,
  AdvertiserCampaignListResponseSchema,
  AdvertiserCampaignDetailResponseSchema,
  SelectApplicantsRequestSchema,
  SelectApplicantsResponseSchema,
  CloseCampaignResponseSchema,
  type CampaignListQuery,
  type CampaignListResponse,
  type CampaignResponse,
  type CampaignTableRow,
  type CampaignDetailTableRow,
  type CampaignDetailResponse,
  type ApplicationRequest,
  type ApplicationResponse,
  type CreateCampaignRequest,
  type AdvertiserCampaignResponse,
  type AdvertiserCampaignListResponse,
  type AdvertiserCampaignDetailResponse,
  type ApplicantResponse,
  type SelectApplicantsRequest,
  type SelectApplicantsResponse,
  type CloseCampaignResponse,
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

export const getCampaignDetail = async (
  client: SupabaseClient,
  campaignId: string,
  userId: string | null
): Promise<
  HandlerResult<CampaignDetailResponse, CampaignServiceError, unknown>
> => {
  const query = client
    .from(CAMPAIGNS_TABLE)
    .select(
      `
      id,
      title,
      recruitment_start,
      recruitment_end,
      recruitment_count,
      benefits,
      mission,
      store_info,
      status,
      created_at,
      advertiser_profiles!inner(
        id,
        company_name,
        location,
        category,
        store_phone
      )
    `
    )
    .eq('id', campaignId)
    .single();

  const { data, error } = await query;

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, campaignErrorCodes.notFound, 'Campaign not found');
    }
    return failure(500, campaignErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, campaignErrorCodes.notFound, 'Campaign not found');
  }

  const rowParse = CampaignDetailTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      'Campaign detail row failed validation',
      rowParse.error.format()
    );
  }

  const validRow: CampaignDetailTableRow = rowParse.data;

  let hasApplied = false;
  let hasInfluencerProfile = false;

  if (userId) {
    const { data: influencerProfile } = await client
      .from('influencer_profiles')
      .select('id, is_verified')
      .eq('user_id', userId)
      .single();

    if (influencerProfile && influencerProfile.is_verified) {
      hasInfluencerProfile = true;

      const { data: application } = await client
        .from('applications')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerProfile.id)
        .single();

      hasApplied = !!application;
    }
  }

  const daysRemaining = calculateDaysRemaining(validRow.recruitment_end);

  const mapped: CampaignDetailResponse = {
    id: validRow.id,
    title: validRow.title,
    recruitmentStart: validRow.recruitment_start,
    recruitmentEnd: validRow.recruitment_end,
    recruitmentCount: validRow.recruitment_count,
    benefits: validRow.benefits,
    mission: validRow.mission,
    storeInfo: validRow.store_info,
    status: validRow.status as 'recruiting' | 'closed' | 'selected',
    category: validRow.advertiser_profiles.category,
    companyName: validRow.advertiser_profiles.company_name,
    location: validRow.advertiser_profiles.location,
    createdAt: validRow.created_at,
    daysRemaining,
    isDeadlineSoon: isDeadlineSoon(validRow.recruitment_end),
    hasApplied,
    hasInfluencerProfile,
    advertiser: {
      id: validRow.advertiser_profiles.id,
      companyName: validRow.advertiser_profiles.company_name,
      location: validRow.advertiser_profiles.location,
      category: validRow.advertiser_profiles.category,
      storePhone: validRow.advertiser_profiles.store_phone,
    },
  };

  const detailParse = CampaignDetailResponseSchema.safeParse(mapped);

  if (!detailParse.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      'Campaign detail response failed validation',
      detailParse.error.format()
    );
  }

  return success(detailParse.data);
};

export const createApplication = async (
  client: SupabaseClient,
  campaignId: string,
  userId: string,
  request: ApplicationRequest
): Promise<
  HandlerResult<ApplicationResponse, CampaignServiceError, unknown>
> => {
  const { message, visitDate } = request;

  // 1. 인플루언서 프로필 조회 및 검증
  const { data: influencerProfile, error: profileError } = await client
    .from('influencer_profiles')
    .select('id, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !influencerProfile) {
    return failure(
      404,
      campaignErrorCodes.influencerNotFound,
      '인플루언서 프로필을 찾을 수 없습니다'
    );
  }

  if (!influencerProfile.is_verified) {
    return failure(
      403,
      campaignErrorCodes.influencerNotFound,
      '인증된 인플루언서만 지원할 수 있습니다'
    );
  }

  // 2. 체험단 상태 확인
  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('id, status, recruitment_start, recruitment_end')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return failure(
      404,
      campaignErrorCodes.notFound,
      '체험단을 찾을 수 없습니다'
    );
  }

  if (campaign.status !== 'recruiting') {
    return failure(
      400,
      campaignErrorCodes.recruitmentClosed,
      '모집이 마감되었습니다'
    );
  }

  const now = new Date();
  const recruitmentStart = new Date(campaign.recruitment_start);
  const recruitmentEnd = new Date(campaign.recruitment_end);

  if (now < recruitmentStart || now > recruitmentEnd) {
    return failure(
      400,
      campaignErrorCodes.recruitmentClosed,
      '모집 기간이 아닙니다'
    );
  }

  // 3. 중복 지원 확인
  const { data: existingApplication } = await client
    .from('applications')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('influencer_id', influencerProfile.id)
    .single();

  if (existingApplication) {
    return failure(
      409,
      campaignErrorCodes.alreadyApplied,
      '이미 지원한 체험단입니다'
    );
  }

  // 4. 방문 예정일 검증
  if (!isFutureDate(visitDate)) {
    return failure(
      400,
      campaignErrorCodes.invalidVisitDate,
      '방문 예정일은 오늘 이후 날짜만 선택 가능합니다'
    );
  }

  if (!isAfterDate(visitDate, campaign.recruitment_end)) {
    return failure(
      400,
      campaignErrorCodes.invalidVisitDate,
      '방문 예정일은 모집 종료일 이후여야 합니다'
    );
  }

  // 5. applications 테이블에 INSERT
  const { data: newApplication, error: insertError } = await client
    .from('applications')
    .insert({
      campaign_id: campaignId,
      influencer_id: influencerProfile.id,
      message,
      visit_date: visitDate,
      status: 'applied',
    })
    .select('id, campaign_id, influencer_id, message, visit_date, status, created_at')
    .single();

  if (insertError || !newApplication) {
    return failure(
      500,
      campaignErrorCodes.applyFailed,
      '지원에 실패했습니다'
    );
  }

  // 6. 결과 반환
  const applicationResponse: ApplicationResponse = {
    id: newApplication.id,
    campaignId: newApplication.campaign_id,
    influencerId: newApplication.influencer_id,
    message: newApplication.message,
    visitDate: newApplication.visit_date,
    status: 'applied',
    createdAt: newApplication.created_at,
  };

  const responseParse = ApplicationResponseSchema.safeParse(applicationResponse);

  if (!responseParse.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      'Application response failed validation',
      responseParse.error.format()
    );
  }

  return success(responseParse.data, 201);
};

export const getAdvertiserCampaigns = async (
  client: SupabaseClient,
  userId: string,
  filters: Pick<CampaignListQuery, 'status' | 'sort' | 'page' | 'limit'>
): Promise<
  HandlerResult<AdvertiserCampaignListResponse, CampaignServiceError, unknown>
> => {
  const { status, sort, page, limit } = filters;

  const { data: advertiserProfile, error: profileError } = await client
    .from('advertiser_profiles')
    .select('id, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !advertiserProfile) {
    return failure(
      404,
      campaignErrorCodes.advertiserNotFound,
      '광고주 프로필을 찾을 수 없습니다'
    );
  }

  if (!advertiserProfile.is_verified) {
    return failure(
      403,
      campaignErrorCodes.advertiserNotVerified,
      '인증된 광고주만 접근 가능합니다'
    );
  }

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
    .eq('advertiser_id', advertiserProfile.id)
    .eq('status', status);

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

  const mappedCampaigns: AdvertiserCampaignResponse[] = [];

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

    const { count: applicantCount } = await client
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', validRow.id);

    const daysRemaining = calculateDaysRemaining(
      validRow.recruitment_end
    );

    const mapped: AdvertiserCampaignResponse = {
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
      applicantCount: applicantCount ?? 0,
    };

    const campaignParse = AdvertiserCampaignResponseSchema.safeParse(mapped);

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

  const response: AdvertiserCampaignListResponse = {
    campaigns: mappedCampaigns,
    pagination,
  };

  const responseParse = AdvertiserCampaignListResponseSchema.safeParse(response);

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

export const createCampaign = async (
  client: SupabaseClient,
  userId: string,
  request: CreateCampaignRequest
): Promise<
  HandlerResult<CampaignResponse, CampaignServiceError, unknown>
> => {
  const { data: advertiserProfile, error: profileError } = await client
    .from('advertiser_profiles')
    .select('id, is_verified, company_name, location, category')
    .eq('user_id', userId)
    .single();

  if (profileError || !advertiserProfile) {
    return failure(
      404,
      campaignErrorCodes.advertiserNotFound,
      '광고주 프로필을 찾을 수 없습니다'
    );
  }

  if (!advertiserProfile.is_verified) {
    return failure(
      403,
      campaignErrorCodes.advertiserNotVerified,
      '인증된 광고주만 체험단을 등록할 수 있습니다'
    );
  }

  const requestParse = CreateCampaignRequestSchema.safeParse(request);

  if (!requestParse.success) {
    return failure(
      400,
      campaignErrorCodes.validationError,
      'Invalid campaign data',
      requestParse.error.format()
    );
  }

  const validRequest = requestParse.data;

  if (!isFutureDate(validRequest.recruitmentStart)) {
    return failure(
      400,
      campaignErrorCodes.invalidDateRange,
      '모집 시작일은 오늘 이후여야 합니다'
    );
  }

  if (!isAfterDate(validRequest.recruitmentEnd, validRequest.recruitmentStart)) {
    return failure(
      400,
      campaignErrorCodes.invalidDateRange,
      '모집 종료일은 시작일 이후여야 합니다'
    );
  }

  const { data: newCampaign, error: insertError } = await client
    .from(CAMPAIGNS_TABLE)
    .insert({
      advertiser_id: advertiserProfile.id,
      title: validRequest.title,
      recruitment_start: validRequest.recruitmentStart,
      recruitment_end: validRequest.recruitmentEnd,
      recruitment_count: validRequest.recruitmentCount,
      benefits: validRequest.benefits,
      mission: validRequest.mission,
      store_info: validRequest.storeInfo,
      status: 'recruiting',
    })
    .select('id, title, recruitment_start, recruitment_end, recruitment_count, benefits, status, created_at')
    .single();

  if (insertError || !newCampaign) {
    return failure(
      500,
      campaignErrorCodes.createFailed,
      '체험단 생성에 실패했습니다',
      insertError
    );
  }

  const daysRemaining = calculateDaysRemaining(newCampaign.recruitment_end);

  const response: CampaignResponse = {
    id: newCampaign.id,
    title: newCampaign.title,
    recruitmentStart: newCampaign.recruitment_start,
    recruitmentEnd: newCampaign.recruitment_end,
    recruitmentCount: newCampaign.recruitment_count,
    benefits: newCampaign.benefits,
    status: newCampaign.status as 'recruiting' | 'closed' | 'selected',
    category: advertiserProfile.category,
    companyName: advertiserProfile.company_name,
    location: advertiserProfile.location,
    createdAt: newCampaign.created_at,
    daysRemaining,
    isDeadlineSoon: isDeadlineSoon(newCampaign.recruitment_end),
  };

  const campaignParse = CampaignResponseSchema.safeParse(response);

  if (!campaignParse.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      'Campaign response failed validation',
      campaignParse.error.format()
    );
  }

  return success(campaignParse.data, 201);
};

export const getAdvertiserCampaignDetail = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<
  HandlerResult<AdvertiserCampaignDetailResponse, CampaignServiceError, unknown>
> => {
  const { data: advertiserProfile, error: profileError } = await client
    .from('advertiser_profiles')
    .select('id, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !advertiserProfile) {
    return failure(
      404,
      campaignErrorCodes.advertiserNotFound,
      '광고주 프로필을 찾을 수 없습니다'
    );
  }

  if (!advertiserProfile.is_verified) {
    return failure(
      403,
      campaignErrorCodes.advertiserNotVerified,
      '인증된 광고주만 접근 가능합니다'
    );
  }

  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select(
      `
      id,
      title,
      recruitment_start,
      recruitment_end,
      recruitment_count,
      benefits,
      mission,
      store_info,
      status,
      created_at,
      advertiser_id,
      advertiser_profiles!inner(
        company_name,
        location,
        category
      )
    `
    )
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    if (campaignError?.code === 'PGRST116') {
      return failure(404, campaignErrorCodes.notFound, '체험단을 찾을 수 없습니다');
    }
    return failure(500, campaignErrorCodes.fetchError, campaignError?.message || '체험단 조회 실패');
  }

  if (campaign.advertiser_id !== advertiserProfile.id) {
    return failure(
      403,
      campaignErrorCodes.unauthorizedAccess,
      '해당 체험단에 접근할 권한이 없습니다'
    );
  }

  const { data: applications, error: applicationsError } = await client
    .from('applications')
    .select(
      `
      id,
      message,
      visit_date,
      status,
      created_at,
      influencer_profiles!inner(
        id,
        user_id,
        profiles!inner(
          name
        )
      )
    `
    )
    .eq('campaign_id', campaignId);

  if (applicationsError) {
    return failure(500, campaignErrorCodes.fetchError, applicationsError.message);
  }

  const applicants: ApplicantResponse[] = [];

  for (const app of applications || []) {
    const influencerProfile = Array.isArray(app.influencer_profiles)
      ? app.influencer_profiles[0]
      : app.influencer_profiles;

    const profile = Array.isArray(influencerProfile.profiles)
      ? influencerProfile.profiles[0]
      : influencerProfile.profiles;

    const { data: channels } = await client
      .from('influencer_channels')
      .select('channel_type, channel_name, follower_count')
      .eq('influencer_id', influencerProfile.id);

    applicants.push({
      id: app.id,
      influencerId: influencerProfile.id,
      influencerName: profile.name,
      message: app.message,
      visitDate: app.visit_date,
      status: app.status as 'applied' | 'selected' | 'rejected',
      createdAt: app.created_at,
      channels: (channels || []).map((ch) => ({
        channelType: ch.channel_type,
        channelName: ch.channel_name,
        followerCount: ch.follower_count || 0,
      })),
    });
  }

  const daysRemaining = calculateDaysRemaining(campaign.recruitment_end);

  const advertiserProfiles = Array.isArray(campaign.advertiser_profiles)
    ? campaign.advertiser_profiles[0]
    : campaign.advertiser_profiles;

  const response: AdvertiserCampaignDetailResponse = {
    id: campaign.id,
    title: campaign.title,
    recruitmentStart: campaign.recruitment_start,
    recruitmentEnd: campaign.recruitment_end,
    recruitmentCount: campaign.recruitment_count,
    benefits: campaign.benefits,
    mission: campaign.mission,
    storeInfo: campaign.store_info,
    status: campaign.status as 'recruiting' | 'closed' | 'selected',
    category: advertiserProfiles.category,
    companyName: advertiserProfiles.company_name,
    location: advertiserProfiles.location,
    createdAt: campaign.created_at,
    daysRemaining,
    isDeadlineSoon: isDeadlineSoon(campaign.recruitment_end),
    applicants,
    applicantCount: applicants.length,
  };

  const responseParse = AdvertiserCampaignDetailResponseSchema.safeParse(response);

  if (!responseParse.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      'Response validation failed',
      responseParse.error.format()
    );
  }

  return success(responseParse.data);
};

export const closeCampaign = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<
  HandlerResult<CloseCampaignResponse, CampaignServiceError, unknown>
> => {
  const { data: advertiserProfile, error: profileError } = await client
    .from('advertiser_profiles')
    .select('id, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !advertiserProfile) {
    return failure(
      404,
      campaignErrorCodes.advertiserNotFound,
      '광고주 프로필을 찾을 수 없습니다'
    );
  }

  if (!advertiserProfile.is_verified) {
    return failure(
      403,
      campaignErrorCodes.advertiserNotVerified,
      '인증된 광고주만 접근 가능합니다'
    );
  }

  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('id, status, advertiser_id')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    if (campaignError?.code === 'PGRST116') {
      return failure(404, campaignErrorCodes.notFound, '체험단을 찾을 수 없습니다');
    }
    return failure(500, campaignErrorCodes.fetchError, campaignError?.message || '체험단 조회 실패');
  }

  if (campaign.advertiser_id !== advertiserProfile.id) {
    return failure(
      403,
      campaignErrorCodes.unauthorizedAccess,
      '해당 체험단에 접근할 권한이 없습니다'
    );
  }

  if (campaign.status === 'closed' || campaign.status === 'selected') {
    return failure(
      400,
      campaignErrorCodes.alreadyClosed,
      '이미 모집이 종료된 체험단입니다'
    );
  }

  if (campaign.status !== 'recruiting') {
    return failure(
      400,
      campaignErrorCodes.alreadyClosed,
      '모집중인 체험단만 종료할 수 있습니다'
    );
  }

  const { error: updateError } = await client
    .from(CAMPAIGNS_TABLE)
    .update({ status: 'closed' })
    .eq('id', campaignId);

  if (updateError) {
    return failure(
      500,
      campaignErrorCodes.closeFailed,
      '모집종료 처리에 실패했습니다',
      updateError
    );
  }

  return success({ status: 'closed' });
};

export const selectApplicants = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string,
  request: SelectApplicantsRequest
): Promise<
  HandlerResult<SelectApplicantsResponse, CampaignServiceError, unknown>
> => {
  const { data: advertiserProfile, error: profileError } = await client
    .from('advertiser_profiles')
    .select('id, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !advertiserProfile) {
    return failure(
      404,
      campaignErrorCodes.advertiserNotFound,
      '광고주 프로필을 찾을 수 없습니다'
    );
  }

  if (!advertiserProfile.is_verified) {
    return failure(
      403,
      campaignErrorCodes.advertiserNotVerified,
      '인증된 광고주만 접근 가능합니다'
    );
  }

  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('id, status, advertiser_id')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    if (campaignError?.code === 'PGRST116') {
      return failure(404, campaignErrorCodes.notFound, '체험단을 찾을 수 없습니다');
    }
    return failure(500, campaignErrorCodes.fetchError, campaignError?.message || '체험단 조회 실패');
  }

  if (campaign.advertiser_id !== advertiserProfile.id) {
    return failure(
      403,
      campaignErrorCodes.unauthorizedAccess,
      '해당 체험단에 접근할 권한이 없습니다'
    );
  }

  if (campaign.status === 'selected') {
    return failure(
      400,
      campaignErrorCodes.alreadySelected,
      '이미 선정이 완료된 체험단입니다'
    );
  }

  if (campaign.status !== 'closed') {
    return failure(
      400,
      campaignErrorCodes.notClosedYet,
      '모집종료된 체험단만 선정할 수 있습니다'
    );
  }

  const { selectedIds } = request;

  const { data: allApplications, error: appError } = await client
    .from('applications')
    .select('id')
    .eq('campaign_id', campaignId);

  if (appError) {
    return failure(500, campaignErrorCodes.fetchError, appError.message);
  }

  const allAppIds = (allApplications || []).map((app) => app.id);

  for (const selectedId of selectedIds) {
    if (!allAppIds.includes(selectedId)) {
      return failure(
        400,
        campaignErrorCodes.invalidSelection,
        '존재하지 않는 지원 ID가 포함되어 있습니다'
      );
    }
  }

  const { error: campaignUpdateError } = await client
    .from(CAMPAIGNS_TABLE)
    .update({ status: 'selected' })
    .eq('id', campaignId);

  if (campaignUpdateError) {
    return failure(
      500,
      campaignErrorCodes.selectFailed,
      '선정 처리에 실패했습니다',
      campaignUpdateError
    );
  }

  const { error: selectedUpdateError } = await client
    .from('applications')
    .update({ status: 'selected' })
    .in('id', selectedIds);

  if (selectedUpdateError) {
    return failure(
      500,
      campaignErrorCodes.selectFailed,
      '선정 상태 업데이트에 실패했습니다',
      selectedUpdateError
    );
  }

  const rejectedIds = allAppIds.filter((id) => !selectedIds.includes(id));

  if (rejectedIds.length > 0) {
    const { error: rejectedUpdateError } = await client
      .from('applications')
      .update({ status: 'rejected' })
      .in('id', rejectedIds);

    if (rejectedUpdateError) {
      return failure(
        500,
        campaignErrorCodes.selectFailed,
        '반려 상태 업데이트에 실패했습니다',
        rejectedUpdateError
      );
    }
  }

  return success({
    selectedCount: selectedIds.length,
    rejectedCount: rejectedIds.length,
  });
};
