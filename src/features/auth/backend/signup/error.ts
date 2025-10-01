export const SignupErrorCodes = {
  // 이메일 관련
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  EMAIL_VERIFICATION_REQUIRED: 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFICATION_FAILED: 'EMAIL_VERIFICATION_FAILED',

  // 비밀번호 관련
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',

  // 입력 유효성 관련
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  INVALID_BIRTH_DATE: 'INVALID_BIRTH_DATE',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_ROLE: 'INVALID_ROLE',

  // 약관 관련
  TERMS_NOT_AGREED: 'TERMS_NOT_AGREED',
  REQUIRED_TERMS_MISSING: 'REQUIRED_TERMS_MISSING',

  // 인증 관련
  INVALID_AUTH_METHOD: 'INVALID_AUTH_METHOD',
  OAUTH_PROVIDER_ERROR: 'OAUTH_PROVIDER_ERROR',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  VERIFICATION_TOKEN_EXPIRED: 'VERIFICATION_TOKEN_EXPIRED',

  // 레이트 리밋
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 데이터베이스 관련
  DATABASE_ERROR: 'DATABASE_ERROR',
  PROFILE_CREATION_FAILED: 'PROFILE_CREATION_FAILED',
  TERMS_SAVE_FAILED: 'TERMS_SAVE_FAILED',

  // 기타
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type SignupErrorCode = typeof SignupErrorCodes[keyof typeof SignupErrorCodes];

export const SignupErrorMessages: Record<SignupErrorCode, string> = {
  [SignupErrorCodes.EMAIL_ALREADY_EXISTS]: '이미 사용 중인 이메일입니다',
  [SignupErrorCodes.INVALID_EMAIL_FORMAT]: '유효한 이메일 주소를 입력해주세요',
  [SignupErrorCodes.EMAIL_VERIFICATION_REQUIRED]: '이메일 인증이 필요합니다',
  [SignupErrorCodes.EMAIL_VERIFICATION_FAILED]: '이메일 인증에 실패했습니다',

  [SignupErrorCodes.WEAK_PASSWORD]: '비밀번호는 8자 이상, 대소문자와 숫자를 포함해야 합니다',
  [SignupErrorCodes.PASSWORD_REQUIRED]: '이메일 인증 방식에서는 비밀번호가 필요합니다',

  [SignupErrorCodes.INVALID_PHONE_NUMBER]: '유효한 휴대폰 번호를 입력해주세요',
  [SignupErrorCodes.INVALID_BIRTH_DATE]: '유효한 생년월일을 입력해주세요',
  [SignupErrorCodes.INVALID_NAME]: '이름을 올바르게 입력해주세요',
  [SignupErrorCodes.INVALID_ROLE]: '역할을 선택해주세요 (광고주 또는 인플루언서)',

  [SignupErrorCodes.TERMS_NOT_AGREED]: '약관에 동의해야 회원가입이 가능합니다',
  [SignupErrorCodes.REQUIRED_TERMS_MISSING]: '필수 약관에 모두 동의해주세요',

  [SignupErrorCodes.INVALID_AUTH_METHOD]: '지원하지 않는 인증 방식입니다',
  [SignupErrorCodes.OAUTH_PROVIDER_ERROR]: '소셜 로그인 처리 중 오류가 발생했습니다',
  [SignupErrorCodes.INVALID_VERIFICATION_TOKEN]: '유효하지 않은 인증 토큰입니다',
  [SignupErrorCodes.VERIFICATION_TOKEN_EXPIRED]: '인증 토큰이 만료되었습니다',

  [SignupErrorCodes.RATE_LIMIT_EXCEEDED]: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요',

  [SignupErrorCodes.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다',
  [SignupErrorCodes.PROFILE_CREATION_FAILED]: '프로필 생성에 실패했습니다',
  [SignupErrorCodes.TERMS_SAVE_FAILED]: '약관 동의 내역 저장에 실패했습니다',

  [SignupErrorCodes.INTERNAL_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  [SignupErrorCodes.VALIDATION_ERROR]: '입력값 검증에 실패했습니다',
};

export class SignupError extends Error {
  constructor(
    public code: SignupErrorCode,
    message?: string,
    public statusCode: number = 400
  ) {
    super(message || SignupErrorMessages[code]);
    this.name = 'SignupError';
  }
}