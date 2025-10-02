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
  closeFailed: 'CAMPAIGN_CLOSE_FAILED',
  alreadyClosed: 'CAMPAIGN_ALREADY_CLOSED',
  selectFailed: 'CAMPAIGN_SELECT_FAILED',
  alreadySelected: 'CAMPAIGN_ALREADY_SELECTED',
  notClosedYet: 'CAMPAIGN_NOT_CLOSED_YET',
  invalidSelection: 'INVALID_APPLICANT_SELECTION',
  unauthorizedAccess: 'UNAUTHORIZED_CAMPAIGN_ACCESS',
} as const;

export type CampaignServiceError =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];
