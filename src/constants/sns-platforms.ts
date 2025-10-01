export const SNS_PLATFORMS = {
  naver: {
    name: '네이버 블로그',
    icon: '📝',
    baseUrl: 'https://blog.naver.com',
    urlPatterns: [
      /^https?:\/\/blog\.naver\.com\/[a-zA-Z0-9_-]+$/,
      /^https?:\/\/blog\.naver\.com\/[a-zA-Z0-9_-]+\/\d+$/,
    ],
    placeholder: 'https://blog.naver.com/블로그ID',
    description: '네이버 블로그 URL을 입력해주세요',
  },
  youtube: {
    name: '유튜브',
    icon: '📺',
    baseUrl: 'https://youtube.com',
    urlPatterns: [
      /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+$/,
      /^https?:\/\/(www\.)?youtube\.com\/channel\/[a-zA-Z0-9_-]+$/,
      /^https?:\/\/(www\.)?youtube\.com\/c\/[a-zA-Z0-9_-]+$/,
      /^https?:\/\/(www\.)?youtube\.com\/user\/[a-zA-Z0-9_-]+$/,
    ],
    placeholder: 'https://youtube.com/@채널명',
    description: '유튜브 채널 URL을 입력해주세요',
  },
  instagram: {
    name: '인스타그램',
    icon: '📷',
    baseUrl: 'https://instagram.com',
    urlPatterns: [
      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
    ],
    placeholder: 'https://instagram.com/사용자명',
    description: '인스타그램 프로필 URL을 입력해주세요',
  },
  threads: {
    name: '스레드',
    icon: '🧵',
    baseUrl: 'https://threads.net',
    urlPatterns: [
      /^https?:\/\/(www\.)?threads\.net\/@[a-zA-Z0-9_.]+\/?$/,
    ],
    placeholder: 'https://threads.net/@사용자명',
    description: '스레드 프로필 URL을 입력해주세요',
  },
} as const;

export type SNSPlatformType = keyof typeof SNS_PLATFORMS;

export const SNS_PLATFORM_OPTIONS = Object.entries(SNS_PLATFORMS).map(
  ([key, value]) => ({
    value: key,
    label: value.name,
    icon: value.icon,
  })
);

export const MAX_CHANNELS = 10;
export const MIN_CHANNELS = 1;