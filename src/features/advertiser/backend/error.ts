export const advertiserErrorCodes = {
  profileNotFound: 'PROFILE_NOT_FOUND',
  userNotFound: 'USER_NOT_FOUND',
  invalidRole: 'INVALID_ROLE',
  businessNumberDuplicate: 'BUSINESS_NUMBER_DUPLICATE',
  businessNumberInvalid: 'BUSINESS_NUMBER_INVALID',
  verificationFailed: 'VERIFICATION_FAILED',
  verificationPending: 'VERIFICATION_PENDING',
  unauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  databaseError: 'DATABASE_ERROR',
} as const;

export type AdvertiserErrorCode = typeof advertiserErrorCodes[keyof typeof advertiserErrorCodes];

export interface AdvertiserServiceError {
  code: AdvertiserErrorCode;
  message: string;
  details?: unknown;
}
