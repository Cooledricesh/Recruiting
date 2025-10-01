export const influencerErrorCodes = {
  profileNotFound: 'PROFILE_NOT_FOUND',
  userNotFound: 'USER_NOT_FOUND',
  channelDuplicate: 'CHANNEL_DUPLICATE',
  maxChannelsExceeded: 'MAX_CHANNELS_EXCEEDED',
  invalidUrlFormat: 'INVALID_URL_FORMAT',
  channelVerificationFailed: 'CHANNEL_VERIFICATION_FAILED',
  channelNotFound: 'CHANNEL_NOT_FOUND',
  unauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  invalidRole: 'INVALID_ROLE',
  databaseError: 'DATABASE_ERROR',
} as const;

export type InfluencerErrorCode = typeof influencerErrorCodes[keyof typeof influencerErrorCodes];

export interface InfluencerServiceError {
  code: InfluencerErrorCode;
  message: string;
  details?: unknown;
}