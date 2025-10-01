/**
 * 비밀번호 유효성 검증 유틸리티
 */

/**
 * 비밀번호 강도 레벨
 */
export enum PasswordStrength {
  VERY_WEAK = 'very_weak',
  WEAK = 'weak',
  FAIR = 'fair',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

/**
 * 비밀번호 유효성 규칙
 */
export interface PasswordRules {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

/**
 * 기본 비밀번호 규칙
 */
export const DEFAULT_PASSWORD_RULES: PasswordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

/**
 * 비밀번호 유효성 검증
 */
export function isValidPassword(
  password: string,
  rules: PasswordRules = DEFAULT_PASSWORD_RULES
): boolean {
  if (!password) return false;

  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = rules;

  if (minLength && password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/[0-9]/.test(password)) return false;
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}

/**
 * 비밀번호 강도 평가
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return PasswordStrength.VERY_WEAK;

  let score = 0;

  // 길이 점수
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // 문자 종류 점수
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // 복잡성 점수
  if (!/^(.)\1+$/.test(password)) score++; // 반복 문자만으로 이루어지지 않음
  if (!/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/.test(password.toLowerCase())) score++; // 연속된 패턴이 아님

  if (score <= 2) return PasswordStrength.VERY_WEAK;
  if (score <= 4) return PasswordStrength.WEAK;
  if (score <= 6) return PasswordStrength.FAIR;
  if (score <= 8) return PasswordStrength.STRONG;
  return PasswordStrength.VERY_STRONG;
}

/**
 * 비밀번호 강도에 따른 색상 반환
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return 'text-red-600 bg-red-100';
    case PasswordStrength.WEAK:
      return 'text-orange-600 bg-orange-100';
    case PasswordStrength.FAIR:
      return 'text-yellow-600 bg-yellow-100';
    case PasswordStrength.STRONG:
      return 'text-blue-600 bg-blue-100';
    case PasswordStrength.VERY_STRONG:
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * 비밀번호 강도에 따른 레이블 반환
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return '매우 약함';
    case PasswordStrength.WEAK:
      return '약함';
    case PasswordStrength.FAIR:
      return '보통';
    case PasswordStrength.STRONG:
      return '강함';
    case PasswordStrength.VERY_STRONG:
      return '매우 강함';
    default:
      return '알 수 없음';
  }
}

/**
 * 비밀번호 유효성 검증 메시지
 */
export function getPasswordValidationMessage(
  password: string,
  rules: PasswordRules = DEFAULT_PASSWORD_RULES
): string | null {
  if (!password) {
    return '비밀번호를 입력해주세요';
  }

  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = rules;

  if (minLength && password.length < minLength) {
    return `비밀번호는 최소 ${minLength}자 이상이어야 합니다`;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return '최소 1개의 대문자를 포함해야 합니다';
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return '최소 1개의 소문자를 포함해야 합니다';
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return '최소 1개의 숫자를 포함해야 합니다';
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return '최소 1개의 특수문자를 포함해야 합니다';
  }

  // 보안 경고
  if (/^(.)\1+$/.test(password)) {
    return '동일한 문자만 반복해서 사용할 수 없습니다';
  }

  if (/^(012|123|234|345|456|567|678|789|890)/.test(password)) {
    return '연속된 숫자는 사용할 수 없습니다';
  }

  if (/^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    return '연속된 문자는 사용할 수 없습니다';
  }

  return null;
}

/**
 * 비밀번호 일치 확인
 */
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * 비밀번호 확인 검증 메시지
 */
export function getPasswordConfirmValidationMessage(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) {
    return '비밀번호 확인을 입력해주세요';
  }

  if (!doPasswordsMatch(password, confirmPassword)) {
    return '비밀번호가 일치하지 않습니다';
  }

  return null;
}