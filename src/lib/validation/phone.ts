/**
 * 휴대폰번호 유효성 검증 유틸리티
 */

// 휴대폰번호 정규식 (한국 휴대폰 형식)
const PHONE_REGEX = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;

/**
 * 휴대폰번호 유효성 검증
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  return PHONE_REGEX.test(phone.replace(/-/g, ''));
}

/**
 * 휴대폰번호 포맷팅 (하이픈 추가)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.length < 10) return cleaned;

  if (cleaned.length === 10) {
    // 010-123-4567
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11) {
    // 010-1234-5678
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  return cleaned;
}

/**
 * 휴대폰번호 입력 시 자동 포맷팅
 */
export function handlePhoneInput(value: string): string {
  // 숫자와 하이픈만 남기기
  const cleaned = value.replace(/[^0-9-]/g, '');

  // 연속된 하이픈 제거
  const singleHyphen = cleaned.replace(/--+/g, '-');

  // 숫자만 추출
  const numbers = singleHyphen.replace(/-/g, '');

  // 최대 11자리까지만 허용
  const truncated = numbers.slice(0, 11);

  // 포맷팅 적용
  return formatPhoneNumber(truncated);
}

/**
 * 휴대폰번호 유효성 검증 메시지
 */
export function getPhoneValidationMessage(phone: string): string | null {
  if (!phone) {
    return '휴대폰번호를 입력해주세요';
  }

  const cleaned = phone.replace(/-/g, '');

  if (cleaned.length < 10) {
    return '휴대폰번호가 너무 짧습니다';
  }

  if (cleaned.length > 11) {
    return '휴대폰번호가 너무 깁니다';
  }

  if (!cleaned.startsWith('01')) {
    return '휴대폰번호는 01로 시작해야 합니다';
  }

  if (!isValidPhoneNumber(phone)) {
    return '유효한 휴대폰번호를 입력해주세요';
  }

  return null;
}