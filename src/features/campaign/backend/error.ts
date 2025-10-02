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
} as const;

export type CampaignServiceError =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];
