export const campaignErrorCodes = {
  fetchError: 'CAMPAIGN_FETCH_ERROR',
  validationError: 'CAMPAIGN_VALIDATION_ERROR',
  invalidParams: 'INVALID_CAMPAIGN_PARAMS',
  notFound: 'CAMPAIGN_NOT_FOUND',
} as const;

export type CampaignServiceError =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];
