/**
 * 사업자등록번호 형식 검증 (10자리 숫자)
 */
export function isValidBusinessNumber(value: string): boolean {
  if (!value) return false;

  const numericValue = value.replace(/[^0-9]/g, '');

  if (numericValue.length !== 10) return false;

  return validateBusinessNumberChecksum(numericValue);
}

/**
 * 사업자번호 포맷팅 (123-45-67890)
 */
export function formatBusinessNumber(value: string): string {
  const numericValue = value.replace(/[^0-9]/g, '');

  if (numericValue.length <= 3) return numericValue;
  if (numericValue.length <= 5) {
    return `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`;
  }

  return `${numericValue.slice(0, 3)}-${numericValue.slice(3, 5)}-${numericValue.slice(5, 10)}`;
}

/**
 * 사업자번호 숫자만 추출 (1234567890)
 */
export function parseBusinessNumber(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * 사업자번호 체크섬 검증 (국세청 알고리즘)
 * 참고: https://www.ftc.go.kr/bizCommPop.do?wrkr_no=1234567890
 */
export function validateBusinessNumberChecksum(value: string): boolean {
  const numericValue = value.replace(/[^0-9]/g, '');

  if (numericValue.length !== 10) return false;

  const digits = numericValue.split('').map(Number);
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  sum += Math.floor((digits[8] * 5) / 10);

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[9];
}

/**
 * 사업자번호 입력 시 자동 포맷팅을 위한 핸들러
 */
export function handleBusinessNumberInput(value: string): string {
  const numericValue = parseBusinessNumber(value);
  const truncated = numericValue.slice(0, 10);
  return formatBusinessNumber(truncated);
}
