import { z } from 'zod';

// 휴대폰번호 정규식 (한국 휴대폰 형식)
const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;

// 생년월일 검증 함수
const isValidBirthDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();

  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) return false;

  // 미래 날짜는 허용하지 않음
  if (date > now) return false;

  // 너무 오래된 날짜도 허용하지 않음 (120년 이상)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  if (date < minDate) return false;

  // 최소 연령 체크 (14세 이상)
  const minAge = new Date();
  minAge.setFullYear(minAge.getFullYear() - 14);
  if (date > minAge) return false;

  return true;
};

// 약관 타입 정의
export const termsTypeSchema = z.enum(['service', 'privacy', 'marketing', 'age']);

// 약관 동의 스키마
export const termsAgreementSchema = z.object({
  type: termsTypeSchema,
  version: z.string().default('1.0.0'),
  agreedAt: z.string().datetime().optional(),
});

// 회원가입 요청 스키마
export const signupRequestSchema = z.object({
  // 기본 정보
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Z]/, '비밀번호는 최소 1개의 대문자를 포함해야 합니다')
    .regex(/[a-z]/, '비밀번호는 최소 1개의 소문자를 포함해야 합니다')
    .regex(/[0-9]/, '비밀번호는 최소 1개의 숫자를 포함해야 합니다')
    .optional(), // OAuth 인증시 선택적
  name: z.string()
    .min(1, '이름을 입력해주세요')
    .max(100, '이름은 100자 이내여야 합니다'),
  birthDate: z.string()
    .refine(isValidBirthDate, '유효한 생년월일을 입력해주세요 (YYYY-MM-DD)'),
  phone: z.string()
    .refine(
      (val) => phoneRegex.test(val.replace(/-/g, '')),
      '유효한 휴대폰 번호를 입력해주세요'
    ),

  // 역할
  role: z.enum(['advertiser', 'influencer'], {
    errorMap: () => ({ message: '역할을 선택해주세요' }),
  }),

  // 약관 동의
  termsAgreed: z.array(termsAgreementSchema)
    .min(2, '필수 약관에 모두 동의해야 합니다'), // 서비스 이용약관, 개인정보처리방침은 필수

  // 인증 방식
  authMethod: z.enum(['email', 'google', 'kakao', 'naver', 'apple']).default('email'),

  // 메타데이터
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
});

// 회원가입 응답 스키마
export const signupResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string().uuid().optional(),
  requiresEmailVerification: z.boolean().default(false),
  redirectUrl: z.string().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  errorCode: z.string().optional(),
});

// 이메일 중복 확인 요청 스키마
export const checkEmailRequestSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
});

// 이메일 중복 확인 응답 스키마
export const checkEmailResponseSchema = z.object({
  available: z.boolean(),
  message: z.string().optional(),
});

// 이메일 인증 요청 스키마
export const verifyEmailRequestSchema = z.object({
  token: z.string().min(1, '인증 토큰이 필요합니다'),
  type: z.enum(['signup', 'recovery']).default('signup'),
});

// 이메일 인증 응답 스키마
export const verifyEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  redirectUrl: z.string().optional(),
  role: z.enum(['advertiser', 'influencer']).optional(),
});

// 타입 내보내기
export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;
export type CheckEmailRequest = z.infer<typeof checkEmailRequestSchema>;
export type CheckEmailResponse = z.infer<typeof checkEmailResponseSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
export type TermsAgreement = z.infer<typeof termsAgreementSchema>;
export type TermsType = z.infer<typeof termsTypeSchema>;