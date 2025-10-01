"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, ExternalLink, Users } from 'lucide-react';
import { SNS_PLATFORMS } from '@/constants/sns-platforms';
import { formatFollowerCount } from '@/lib/validation/sns-channel';
import { ChannelValidation } from './ChannelValidation';
import type { Channel } from '../lib/dto';

interface ChannelListProps {
  channels: Array<Channel & { id: string }>;
  onDelete: (channelId: string) => void;
  isDeleting?: boolean;
  maxChannels?: number;
}

export function ChannelList({
  channels,
  onDelete,
  isDeleting = false,
  maxChannels = 10,
}: ChannelListProps) {
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null);

  const handleDeleteClick = (channelId: string) => {
    setDeleteChannelId(channelId);
  };

  const handleDeleteConfirm = () => {
    if (deleteChannelId) {
      onDelete(deleteChannelId);
      setDeleteChannelId(null);
    }
  };

  if (channels.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-2">
            아직 등록된 SNS 채널이 없습니다
          </p>
          <p className="text-xs text-gray-400">
            위 폼에서 SNS 채널을 추가해주세요
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            등록된 채널 ({channels.length}/{maxChannels})
          </h3>
          {channels.length >= maxChannels && (
            <Badge variant="secondary">
              최대 채널 수 도달
            </Badge>
          )}
        </div>

        <div className="grid gap-3">
          {channels.map((channel) => {
            const platform = SNS_PLATFORMS[channel.channelType];

            return (
              <Card key={channel.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{platform?.icon}</span>
                      <div>
                        <CardTitle className="text-base">
                          {channel.channelName}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {platform?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChannelValidation status={channel.verificationStatus} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(channel.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                      <a
                        href={channel.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {channel.channelUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">
                        팔로워 {formatFollowerCount(channel.followerCount)}명
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog
        open={!!deleteChannelId}
        onOpenChange={() => setDeleteChannelId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>채널 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 채널을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}