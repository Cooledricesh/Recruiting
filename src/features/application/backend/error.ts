export const applicationErrorCodes = {
  invalidParams: 'INVALID_PARAMS',
  fetchError: 'FETCH_ERROR',
  influencerNotFound: 'INFLUENCER_NOT_FOUND',
  unauthorized: 'UNAUTHORIZED',
} as const;

export type ApplicationServiceError =
  (typeof applicationErrorCodes)[keyof typeof applicationErrorCodes];
