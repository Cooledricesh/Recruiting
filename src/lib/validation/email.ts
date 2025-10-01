/**
 * 이메일 유효성 검증 유틸리티
 */

// 이메일 정규식 (RFC 5322 기반 간소화 버전)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 일반적인 이메일 도메인
const COMMON_DOMAINS = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'kakao.com',
  'nate.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
];

/**
 * 이메일 유효성 검증
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * 이메일 정규화 (소문자 변환, 공백 제거)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * 이메일 도메인 추출
 */
export function getEmailDomain(email: string): string | null {
  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');

  if (parts.length !== 2) return null;

  return parts[1];
}

/**
 * 이메일 로컬 파트 추출 (@ 앞부분)
 */
export function getEmailLocalPart(email: string): string | null {
  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');

  if (parts.length !== 2) return null;

  return parts[0];
}

/**
 * 일반적인 도메인인지 확인
 */
export function isCommonEmailDomain(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  return COMMON_DOMAINS.includes(domain);
}

/**
 * 이메일 도메인 추천 (오타 수정)
 */
export function suggestEmailDomain(domain: string): string | null {
  const normalized = domain.toLowerCase();

  // 간단한 오타 수정 매핑
  const corrections: Record<string, string> = {
    'gamil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'navr.com': 'naver.com',
    'nvaer.com': 'naver.com',
    'hanmai.net': 'hanmail.net',
    'daun.net': 'daum.net',
    'kakoa.com': 'kakao.com',
  };

  return corrections[normalized] || null;
}

/**
 * 이메일 유효성 검증 메시지
 */
export function getEmailValidationMessage(email: string): string | null {
  if (!email) {
    return '이메일을 입력해주세요';
  }

  const trimmed = email.trim();

  if (trimmed.length < 3) {
    return '이메일이 너무 짧습니다';
  }

  if (!trimmed.includes('@')) {
    return '@ 기호가 필요합니다';
  }

  const parts = trimmed.split('@');

  if (parts.length !== 2) {
    return '올바른 이메일 형식이 아닙니다';
  }

  const [localPart, domain] = parts;

  if (!localPart) {
    return '@ 앞에 이메일 ID가 필요합니다';
  }

  if (!domain) {
    return '@ 뒤에 도메인이 필요합니다';
  }

  if (!domain.includes('.')) {
    return '도메인에 .이 필요합니다';
  }

  if (!isValidEmail(trimmed)) {
    return '유효한 이메일 주소를 입력해주세요';
  }

  // 오타 체크
  const suggestion = suggestEmailDomain(domain);
  if (suggestion) {
    return `혹시 ${suggestion}을(를) 의도하셨나요?`;
  }

  return null;
}

/**
 * 이메일 마스킹 (보안용)
 */
export function maskEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const localPart = getEmailLocalPart(normalized);
  const domain = getEmailDomain(normalized);

  if (!localPart || !domain) return email;

  const visibleChars = Math.min(2, Math.floor(localPart.length / 2));
  const maskedLocal = localPart.substring(0, visibleChars) +
                      '*'.repeat(Math.max(localPart.length - visibleChars, 3));

  return `${maskedLocal}@${domain}`;
}