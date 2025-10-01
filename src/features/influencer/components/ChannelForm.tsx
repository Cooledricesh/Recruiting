"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  SNS_PLATFORM_OPTIONS,
  SNS_PLATFORMS,
  type SNSPlatformType,
} from '@/constants/sns-platforms';
import {
  formatFollowerCount,
  parseFollowerCount,
  isUniqueChannel,
} from '@/lib/validation/sns-channel';
import { useChannelValidation } from '../hooks/useChannelValidation';
import { Plus } from 'lucide-react';

type ChannelInput = {
  channelType: 'naver' | 'youtube' | 'instagram' | 'threads';
  channelName: string;
  channelUrl: string;
  followerCount: number;
};

interface ChannelFormProps {
  onAdd: (channel: ChannelInput) => void;
  existingChannels: Array<{ channelUrl: string }>;
  disabled?: boolean;
}

export function ChannelForm({
  onAdd,
  existingChannels,
  disabled = false,
}: ChannelFormProps) {
  const [platform, setPlatform] = useState<SNSPlatformType>('naver');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [followerCount, setFollowerCount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { validationResults, validateUrl, clearAllValidations } = useChannelValidation();
  const urlValidation = validationResults['channel-form-url'];

  // URL 검증 완료 시 채널명 자동 추출
  useEffect(() => {
    if (urlValidation?.isValid && urlValidation.extractedName && !channelName) {
      setChannelName(urlValidation.extractedName);
    }
  }, [urlValidation, channelName]);

  const handlePlatformChange = (value: string) => {
    setPlatform(value as SNSPlatformType);
    setChannelUrl('');
    setChannelName('');
    clearAllValidations();
    setErrors({});
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setChannelUrl(url);

    if (url) {
      validateUrl(platform, url, 'channel-form-url');
    }

    // 중복 체크
    if (url && !isUniqueChannel(existingChannels, url)) {
      setErrors(prev => ({ ...prev, url: '이미 등록된 채널 URL입니다' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.url;
        return newErrors;
      });
    }
  };

  const handleFollowerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    const formatted = formatFollowerCount(parseInt(numericValue || '0'));
    setFollowerCount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!channelName || channelName.trim() === '') {
      newErrors.name = '채널명을 입력해주세요';
    }

    if (!channelUrl) {
      newErrors.url = 'URL을 입력해주세요';
    } else if (urlValidation && !urlValidation.isValid) {
      newErrors.url = urlValidation.errorMessage || '유효하지 않은 URL입니다';
    } else if (!isUniqueChannel(existingChannels, channelUrl)) {
      newErrors.url = '이미 등록된 채널 URL입니다';
    }

    if (!followerCount || parseFollowerCount(followerCount) === 0) {
      newErrors.followers = '팔로워수를 입력해주세요';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      channelType: platform,
      channelName,
      channelUrl: urlValidation?.normalizedUrl || channelUrl,
      followerCount: parseFollowerCount(followerCount),
    });

    // 폼 초기화
    setChannelName('');
    setChannelUrl('');
    setFollowerCount('');
    setErrors({});
    clearAllValidations();
  };

  const selectedPlatform = SNS_PLATFORMS[platform];

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platform">플랫폼 선택</Label>
          <Select
            value={platform}
            onValueChange={handlePlatformChange}
            disabled={disabled}
          >
            <SelectTrigger id="platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SNS_PLATFORM_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channelUrl">채널 URL</Label>
          <Input
            id="channelUrl"
            type="url"
            value={channelUrl}
            onChange={handleUrlChange}
            placeholder={selectedPlatform.placeholder}
            disabled={disabled}
            className={errors.url ? 'border-red-500' : ''}
          />
          {errors.url && (
            <p className="text-sm text-red-500">{errors.url}</p>
          )}
          {urlValidation && !urlValidation.isValid && channelUrl && !errors.url && (
            <p className="text-sm text-red-500">{urlValidation.errorMessage}</p>
          )}
          <p className="text-xs text-gray-500">
            {selectedPlatform.description}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channelName">채널명</Label>
          <Input
            id="channelName"
            type="text"
            value={channelName}
            onChange={(e) => {
              setChannelName(e.target.value);
              if (errors.name) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.name;
                  return newErrors;
                });
              }
            }}
            placeholder={urlValidation?.extractedName || "채널 이름을 입력해주세요"}
            disabled={disabled}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
          {urlValidation?.extractedName && !channelName && (
            <p className="text-xs text-blue-600">
              URL에서 채널명이 감지되었습니다: {urlValidation.extractedName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="followerCount">팔로워수</Label>
          <Input
            id="followerCount"
            type="text"
            value={followerCount}
            onChange={handleFollowerCountChange}
            placeholder="0"
            disabled={disabled}
            className={errors.followers ? 'border-red-500' : ''}
          />
          {errors.followers && (
            <p className="text-sm text-red-500">{errors.followers}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={disabled}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          채널 추가
        </Button>
      </form>
    </Card>
  );
}