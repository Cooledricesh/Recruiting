import { isAfter, isBefore, parseISO, startOfDay } from 'date-fns';

/**
 * 주어진 날짜 문자열이 오늘보다 이후 날짜인지 확인합니다.
 * @param dateString ISO 날짜 문자열 (YYYY-MM-DD)
 * @returns 미래 날짜이면 true, 오늘이거나 과거이면 false
 */
export const isFutureDate = (dateString: string): boolean => {
  try {
    const targetDate = startOfDay(parseISO(dateString));
    const today = startOfDay(new Date());
    return isAfter(targetDate, today);
  } catch {
    return false;
  }
};

/**
 * target 날짜가 reference 날짜보다 이후인지 확인합니다.
 * @param target 비교 대상 날짜 (ISO 문자열)
 * @param reference 기준 날짜 (ISO 문자열)
 * @returns target이 reference보다 이후이면 true
 */
export const isAfterDate = (target: string, reference: string): boolean => {
  try {
    const targetDate = startOfDay(parseISO(target));
    const referenceDate = startOfDay(parseISO(reference));
    return isAfter(targetDate, referenceDate);
  } catch {
    return false;
  }
};

/**
 * target 날짜가 reference 날짜보다 이전인지 확인합니다.
 * @param target 비교 대상 날짜 (ISO 문자열)
 * @param reference 기준 날짜 (ISO 문자열)
 * @returns target이 reference보다 이전이면 true
 */
export const isBeforeDate = (target: string, reference: string): boolean => {
  try {
    const targetDate = startOfDay(parseISO(target));
    const referenceDate = startOfDay(parseISO(reference));
    return isBefore(targetDate, referenceDate);
  } catch {
    return false;
  }
};
