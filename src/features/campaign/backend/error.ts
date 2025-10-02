export const campaignErrorCodes = {
  fetchError: 'CAMPAIGN_FETCH_ERROR',
  validationError: 'CAMPAIGN_VALIDATION_ERROR',
  invalidParams: 'INVALID_CAMPAIGN_PARAMS',
  notFound: 'CAMPAIGN_NOT_FOUND',
  alreadyApplied: 'ALREADY_APPLIED',
  recruitmentClosed: 'RECRUITMENT_CLOSED',
  invalidVisitDate: 'INVALID_VISIT_DATE',
  influencerNotFound: 'INFLUENCER_NOT_FOUND',
  applyFailed: 'APPLY_FAILED',
  advertiserNotFound: 'ADVERTISER_NOT_FOUND',
  advertiserNotVerified: 'ADVERTISER_NOT_VERIFIED',
  invalidDateRange: 'INVALID_DATE_RANGE',
  createFailed: 'CAMPAIGN_CREATE_FAILED',
} as const;

export type CampaignServiceError =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];
