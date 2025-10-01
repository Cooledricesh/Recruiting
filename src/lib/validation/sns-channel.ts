import { z } from 'zod';
import { SNS_PLATFORMS, type SNSPlatformType } from '@/constants/sns-platforms';

/**
 * URL 정규화 - trailing slash 제거, 소문자 변환
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim().toLowerCase();

  // trailing slash 제거
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // http:// 추가 (없는 경우)
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  return normalized;
}

/**
 * SNS 플랫폼별 URL 검증
 */
export function validateChannelUrl(platform: SNSPlatformType, url: string): boolean {
  const normalizedUrl = normalizeUrl(url);
  const platformConfig = SNS_PLATFORMS[platform];

  if (!platformConfig) {
    return false;
  }

  return platformConfig.urlPatterns.some(pattern =>
    pattern.test(normalizedUrl)
  );
}

/**
 * URL에서 채널명 추출
 */
export function extractChannelName(platform: SNSPlatformType, url: string): string | null {
  const normalizedUrl = normalizeUrl(url);

  switch (platform) {
    case 'naver': {
      const match = normalizedUrl.match(/blog\.naver\.com\/([a-zA-Z0-9_-]+)/);
      return match?.[1] || null;
    }
    case 'youtube': {
      // @username 형식
      let match = normalizedUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
      if (match) return `@${match[1]}`;

      // channel/ID 형식
      match = normalizedUrl.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];

      // c/name 형식
      match = normalizedUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];

      // user/name 형식
      match = normalizedUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];

      return null;
    }
    case 'instagram': {
      const match = normalizedUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
      return match?.[1] || null;
    }
    case 'threads': {
      const match = normalizedUrl.match(/threads\.net\/@([a-zA-Z0-9_.]+)/);
      return match?.[1] ? `@${match[1]}` : null;
    }
    default:
      return null;
  }
}

/**
 * Zod 스키마 - 채널 URL 검증
 */
export const channelUrlSchema = (platform: SNSPlatformType) =>
  z.string()
    .url('유효한 URL을 입력해주세요')
    .refine(
      (url) => validateChannelUrl(platform, url),
      `유효한 ${SNS_PLATFORMS[platform].name} URL을 입력해주세요`
    );

/**
 * 팔로워수 포맷팅 (천단위 콤마)
 */
export function formatFollowerCount(count: number): string {
  return new Intl.NumberFormat('ko-KR').format(count);
}

/**
 * 팔로워수 파싱 (콤마 제거)
 */
export function parseFollowerCount(value: string): number {
  const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 채널 URL 유니크 체크
 */
export function isUniqueChannel(
  channels: Array<{ channelUrl: string }>,
  newUrl: string
): boolean {
  const normalizedNewUrl = normalizeUrl(newUrl);
  return !channels.some(
    channel => normalizeUrl(channel.channelUrl) === normalizedNewUrl
  );
}