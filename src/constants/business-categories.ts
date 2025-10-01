export const BUSINESS_CATEGORIES = [
  { value: 'food', label: '음식점' },
  { value: 'cafe', label: '카페/디저트' },
  { value: 'beauty', label: '뷰티/미용' },
  { value: 'health', label: '헬스/피트니스' },
  { value: 'entertainment', label: '문화/엔터테인먼트' },
  { value: 'shopping', label: '쇼핑/리테일' },
  { value: 'service', label: '서비스' },
  { value: 'other', label: '기타' },
] as const;

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number]['value'];

export const BUSINESS_CATEGORY_OPTIONS = BUSINESS_CATEGORIES.map(cat => ({
  value: cat.value,
  label: cat.label,
}));
