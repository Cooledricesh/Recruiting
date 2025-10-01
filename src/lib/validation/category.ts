import { BUSINESS_CATEGORIES, type BusinessCategory } from '@/constants/business-categories';

/**
 * 업체 카테고리 유효성 검증
 */
export function isValidCategory(category: string): category is BusinessCategory {
  return BUSINESS_CATEGORIES.some(cat => cat.value === category);
}

/**
 * 카테고리 값으로 라벨 조회
 */
export function getCategoryLabel(category: string): string {
  const found = BUSINESS_CATEGORIES.find(cat => cat.value === category);
  return found?.label || category;
}
