import { z } from 'zod';

// SNS 채널 타입
export const channelTypeSchema = z.enum(['naver', 'youtube', 'instagram', 'threads']);

// 채널 검증 상태
export const verificationStatusSchema = z.enum(['pending', 'verified', 'failed']);

// SNS 채널 스키마
export const channelSchema = z.object({
  id: z.string().uuid().optional(),
  channelType: channelTypeSchema,
  channelName: z.string()
    .min(1, '채널명을 입력해주세요')
    .max(100, '채널명은 100자 이내여야 합니다'),
  channelUrl: z.string()
    .url('유효한 URL을 입력해주세요')
    .max(500, 'URL은 500자 이내여야 합니다'),
  followerCount: z.number()
    .int('팔로워수는 정수여야 합니다')
    .min(0, '팔로워수는 0 이상이어야 합니다')
    .default(0),
  verificationStatus: verificationStatusSchema.default('pending'),
});

// 프로필 생성/업데이트 요청 스키마
export const createProfileRequestSchema = z.object({
  channels: z.array(channelSchema)
    .min(1, '최소 1개 이상의 채널을 등록해야 합니다')
    .max(10, '최대 10개까지 채널을 등록할 수 있습니다'),
});

// 채널 추가 요청 스키마
export const addChannelRequestSchema = z.object({
  channel: channelSchema,
});

// 채널 ID 파라미터 스키마
export const channelIdParamSchema = z.object({
  channelId: z.string().uuid('유효한 채널 ID가 아닙니다'),
});

// 프로필 응답 스키마
export const profileResponseSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  isVerified: z.boolean(),
  channels: z.array(
    channelSchema.extend({
      id: z.string().uuid(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    })
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 성공 응답 스키마
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// 타입 내보내기
export type ChannelType = z.infer<typeof channelTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type Channel = z.infer<typeof channelSchema>;
export type CreateProfileRequest = z.infer<typeof createProfileRequestSchema>;
export type AddChannelRequest = z.infer<typeof addChannelRequestSchema>;
export type ChannelIdParam = z.infer<typeof channelIdParamSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;