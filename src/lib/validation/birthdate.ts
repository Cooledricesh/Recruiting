/**
 * 생년월일 유효성 검증 유틸리티
 */

import { format, parse, isValid, isBefore, isAfter, subYears } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 생년월일 유효성 검증
 */
export function isValidBirthDate(dateString: string): boolean {
  if (!dateString) return false;

  try {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());

    // 유효한 날짜인지 확인
    if (!isValid(date)) return false;

    const now = new Date();

    // 미래 날짜는 허용하지 않음
    if (isAfter(date, now)) return false;

    // 너무 오래된 날짜도 허용하지 않음 (120년 이상)
    const minDate = subYears(now, 120);
    if (isBefore(date, minDate)) return false;

    // 최소 연령 체크 (14세 이상)
    const minAge = subYears(now, 14);
    if (isAfter(date, minAge)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * 생년월일 포맷팅
 */
export function formatBirthDate(date: Date | string): string {
  if (typeof date === 'string') {
    const parsed = parse(date, 'yyyy-MM-dd', new Date());
    if (!isValid(parsed)) return '';
    return format(parsed, 'yyyy-MM-dd');
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * 생년월일 표시 포맷팅 (한글)
 */
export function formatBirthDateDisplay(date: Date | string): string {
  if (typeof date === 'string') {
    const parsed = parse(date, 'yyyy-MM-dd', new Date());
    if (!isValid(parsed)) return '';
    return format(parsed, 'yyyy년 M월 d일', { locale: ko });
  }
  return format(date, 'yyyy년 M월 d일', { locale: ko });
}

/**
 * 나이 계산
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string'
    ? parse(birthDate, 'yyyy-MM-dd', new Date())
    : birthDate;

  if (!isValid(birth)) return 0;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * 생년월일 유효성 검증 메시지
 */
export function getBirthDateValidationMessage(dateString: string): string | null {
  if (!dateString) {
    return '생년월일을 입력해주세요';
  }

  try {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());

    if (!isValid(date)) {
      return '유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)';
    }

    const now = new Date();

    if (isAfter(date, now)) {
      return '미래의 날짜는 선택할 수 없습니다';
    }

    const minDate = subYears(now, 120);
    if (isBefore(date, minDate)) {
      return '너무 오래된 날짜입니다';
    }

    const age = calculateAge(date);
    if (age < 14) {
      return '만 14세 이상만 가입할 수 있습니다';
    }

    return null;
  } catch {
    return '유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)';
  }
}

/**
 * 날짜 선택 컴포넌트용 최소/최대 날짜 계산
 */
export function getBirthDateRange() {
  const now = new Date();
  const minDate = subYears(now, 120);
  const maxDate = subYears(now, 14);

  return {
    min: format(minDate, 'yyyy-MM-dd'),
    max: format(maxDate, 'yyyy-MM-dd'),
  };
}