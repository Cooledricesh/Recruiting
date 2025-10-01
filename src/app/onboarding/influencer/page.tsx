"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useInfluencerProfile } from '@/features/influencer/hooks/useInfluencerProfile';
import { ChannelForm } from '@/features/influencer/components/ChannelForm';
import { ChannelList } from '@/features/influencer/components/ChannelList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InfluencerFormStorage } from '@/lib/storage/local-storage';
import { MAX_CHANNELS } from '@/constants/sns-platforms';
import { Loader2, Save } from 'lucide-react';
import type { Channel } from '@/features/influencer/lib/dto';

type InfluencerOnboardingPageProps = {
  params: Promise<Record<string, never>>;
};

type ChannelInput = {
  channelType: 'naver' | 'youtube' | 'instagram' | 'threads';
  channelName: string;
  channelUrl: string;
  followerCount: number;
};

export default function InfluencerOnboardingPage({ params }: InfluencerOnboardingPageProps) {
  void params;
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useCurrentUser();
  const {
    profile,
    isLoading: isProfileLoading,
    createOrUpdateProfile,
    isCreatingOrUpdating,
    deleteChannel,
    isDeletingChannel,
  } = useInfluencerProfile();

  const [channels, setChannels] = useState<ChannelInput[]>([]);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);


  // 기존 프로필 로드 또는 임시 저장 데이터 로드
  useEffect(() => {
    if (hasLoadedFromStorage) return;

    if (profile) {
      // 기존 프로필이 있으면 channels state는 비워둠 (새로 추가할 채널만 담기 위해)
      setChannels([]);
      InfluencerFormStorage.clear();
    } else {
      // 프로필이 없으면 임시 저장 데이터 확인
      const savedData = InfluencerFormStorage.load();
      if (savedData && savedData.channels.length > 0) {
        setChannels(savedData.channels);
      }
    }

    setHasLoadedFromStorage(true);
  }, [profile, hasLoadedFromStorage]);

  // 채널 변경 시 임시 저장 (프로필이 없을 때만)
  useEffect(() => {
    if (hasLoadedFromStorage && channels.length > 0 && !profile) {
      const timeoutId = setTimeout(() => {
        InfluencerFormStorage.save(channels);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [channels, hasLoadedFromStorage, profile]);

  const handleAddChannel = (channel: ChannelInput) => {
    if (channels.length >= MAX_CHANNELS) {
      return;
    }
    setChannels(prev => [...prev, channel]);
  };

  const handleDeleteChannel = (channelId: string) => {
    // 기존 프로필의 채널인 경우 API 호출
    const existingChannel = profile?.channels.find(ch => ch.id === channelId);
    if (existingChannel) {
      deleteChannel(channelId);
    } else {
      // 새로 추가한 채널인 경우 로컬 상태에서만 제거
      setChannels(prev => prev.filter((_, idx) => `temp-${idx}` !== channelId));
    }
  };

  const handleSave = () => {
    // 기존 채널 + 새로 추가한 채널을 모두 포함
    const existingChannels = profile?.channels.map(ch => ({
      channelType: ch.channelType!,
      channelName: ch.channelName!,
      channelUrl: ch.channelUrl!,
      followerCount: ch.followerCount!,
    })) || [];

    const allChannels = [...existingChannels, ...channels];

    // 중복 URL 제거 (정규화된 URL 기준)
    const seen = new Set<string>();
    const uniqueChannels = allChannels.filter(ch => {
      const normalized = ch.channelUrl.trim().toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });

    if (uniqueChannels.length === 0) {
      return;
    }

    createOrUpdateProfile(
      { channels: uniqueChannels },
      {
        onSuccess: () => {
          InfluencerFormStorage.clear();
          setChannels([]); // 새로 추가한 채널 state 초기화
          router.push('/');
        },
      }
    );
  };

  const handleSkip = () => {
    InfluencerFormStorage.clear();
    router.push('/');
  };

  // 로딩 중
  if (isAuthLoading || isProfileLoading || !hasLoadedFromStorage) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 채널 목록 (기존 + 새로운)
  const displayChannels: Array<Channel & { id: string }> = [
    ...(profile?.channels.filter((ch): ch is Channel & { id: string } => !!ch.id) || []),
    ...channels.map((ch, idx) => ({
      id: `temp-${idx}`,
      channelType: ch.channelType,
      channelName: ch.channelName,
      channelUrl: ch.channelUrl,
      followerCount: ch.followerCount,
      verificationStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  ];

  const canAddMore = displayChannels.length < MAX_CHANNELS;
  const canSave = channels.length > 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">인플루언서 정보 등록</CardTitle>
            <CardDescription className="mt-2">
              체험단에 지원하기 위한 SNS 채널 정보를 등록해주세요.
              최소 1개 이상, 최대 10개까지 등록할 수 있습니다.
            </CardDescription>
          </div>

          {profile && (
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                이미 프로필이 등록되어 있습니다. 채널을 추가하거나 수정할 수 있습니다.
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 채널 추가 폼 */}
          {canAddMore && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">SNS 채널 추가</h3>
                <ChannelForm
                  onAdd={handleAddChannel}
                  existingChannels={displayChannels.map(ch => ({ channelUrl: ch.channelUrl! }))}
                  disabled={isCreatingOrUpdating}
                />
              </div>
              <Separator />
            </>
          )}

          {/* 등록된 채널 목록 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">등록된 채널</h3>
            <ChannelList
              channels={displayChannels}
              onDelete={handleDeleteChannel}
              isDeleting={isDeletingChannel}
              maxChannels={MAX_CHANNELS}
            />
          </div>

          <Separator />

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isCreatingOrUpdating}
            >
              나중에 하기
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isCreatingOrUpdating}
              className="min-w-32"
            >
              {isCreatingOrUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장하고 완료
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}