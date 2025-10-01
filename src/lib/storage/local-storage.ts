interface StorageData<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

const DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24시간

export class LocalStorageManager {
  private static isClient = typeof window !== 'undefined';

  /**
   * 데이터 저장
   */
  static set<T>(key: string, value: T, expiryMs: number = DEFAULT_EXPIRY): void {
    if (!this.isClient) return;

    try {
      const data: StorageData<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiryMs,
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * 데이터 조회
   */
  static get<T>(key: string): T | null {
    if (!this.isClient) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const data: StorageData<T> = JSON.parse(item);

      // 만료 체크
      if (Date.now() > data.expiresAt) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * 데이터 삭제
   */
  static remove(key: string): void {
    if (!this.isClient) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  /**
   * 특정 prefix로 시작하는 모든 키 삭제
   */
  static clearByPrefix(prefix: string): void {
    if (!this.isClient) return;

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage by prefix:', error);
    }
  }

  /**
   * 만료된 아이템 정리
   */
  static cleanExpired(): void {
    if (!this.isClient) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return;

          const data = JSON.parse(item);
          if (data.expiresAt && Date.now() > data.expiresAt) {
            localStorage.removeItem(key);
          }
        } catch {
          // 파싱 실패한 아이템은 무시
        }
      });
    } catch (error) {
      console.error('Failed to clean expired items:', error);
    }
  }
}

// 인플루언서 온보딩 폼 전용 헬퍼
export const INFLUENCER_FORM_KEY = 'influencer_onboarding_form';

export interface InfluencerFormData {
  channels: Array<{
    channelType: "naver" | "youtube" | "instagram" | "threads";
    channelName: string;
    channelUrl: string;
    followerCount: number;
  }>;
  lastSaved: number;
}

export const InfluencerFormStorage = {
  save(data: InfluencerFormData['channels']): void {
    LocalStorageManager.set<InfluencerFormData>(
      INFLUENCER_FORM_KEY,
      {
        channels: data,
        lastSaved: Date.now(),
      },
      7 * 24 * 60 * 60 * 1000 // 7일
    );
  },

  load(): InfluencerFormData | null {
    return LocalStorageManager.get<InfluencerFormData>(INFLUENCER_FORM_KEY);
  },

  clear(): void {
    LocalStorageManager.remove(INFLUENCER_FORM_KEY);
  },
};