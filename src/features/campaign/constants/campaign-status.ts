export const CAMPAIGN_STATUS = {
  recruiting: 'recruiting',
  closed: 'closed',
  selected: 'selected',
} as const;

export type CampaignStatus =
  (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  recruiting: '모집중',
  closed: '모집종료',
  selected: '선정완료',
};

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'deadline', label: '마감임박순' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
