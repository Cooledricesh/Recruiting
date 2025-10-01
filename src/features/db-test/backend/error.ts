export const dbTestErrorCodes = {
  connectionError: 'DB_CONNECTION_ERROR',
  queryError: 'DB_QUERY_ERROR',
  validationError: 'DB_VALIDATION_ERROR',
} as const;

export type DbTestServiceError =
  (typeof dbTestErrorCodes)[keyof typeof dbTestErrorCodes];
