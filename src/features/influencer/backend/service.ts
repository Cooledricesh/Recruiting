import { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
  type ErrorResult,
} from '@/backend/http/response';
import {
  influencerErrorCodes,
  type InfluencerServiceError,
} from './error';
import type {
  Channel,
  CreateProfileRequest,
  ProfileResponse,
} from './schema';

interface DatabaseChannel {
  id: string;
  influencer_id: string;
  channel_type: string;
  channel_name: string;
  channel_url: string;
  follower_count: number;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseInfluencerProfile {
  id: string;
  user_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 인플루언서 프로필 조회
 */
export async function getInfluencerProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<HandlerResult<ProfileResponse, string>> {
  try {
    // 사용자 역할 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return failure(
        404,
        influencerErrorCodes.userNotFound,
        '사용자를 찾을 수 없습니다',
        { userId }
      );
    }

    if (profile.role !== 'influencer') {
      return failure(
        403,
        influencerErrorCodes.invalidRole,
        '인플루언서 권한이 없습니다',
        { role: profile.role }
      );
    }

    // 인플루언서 프로필 조회
    const { data: influencerProfile, error: influencerError } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (influencerError || !influencerProfile) {
      return failure(
        404,
        influencerErrorCodes.profileNotFound,
        '인플루언서 프로필을 찾을 수 없습니다',
        { userId }
      );
    }

    // 채널 목록 조회
    const { data: channels, error: channelsError } = await supabase
      .from('influencer_channels')
      .select('*')
      .eq('influencer_id', influencerProfile.id)
      .order('created_at', { ascending: false });

    if (channelsError) {
      return failure(
        500,
        influencerErrorCodes.databaseError,
        '채널 정보를 조회하는데 실패했습니다',
        channelsError
      );
    }

    const response: ProfileResponse = {
      profileId: influencerProfile.id,
      userId: influencerProfile.user_id,
      isVerified: influencerProfile.is_verified,
      channels: (channels || []).map(ch => ({
        id: ch.id,
        channelType: ch.channel_type as Channel['channelType'],
        channelName: ch.channel_name,
        channelUrl: ch.channel_url,
        followerCount: ch.follower_count,
        verificationStatus: ch.verification_status as Channel['verificationStatus'],
        createdAt: ch.created_at,
        updatedAt: ch.updated_at,
      })),
      createdAt: influencerProfile.created_at,
      updatedAt: influencerProfile.updated_at,
    };

    return success(response);
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.databaseError,
      '프로필 조회 중 오류가 발생했습니다',
      error
    );
  }
}

/**
 * 인플루언서 프로필 생성 또는 업데이트
 */
export async function createOrUpdateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: CreateProfileRequest
): Promise<HandlerResult<ProfileResponse, string>> {
  try {
    // 트랜잭션 시작
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return failure(
        404,
        influencerErrorCodes.userNotFound,
        '사용자를 찾을 수 없습니다',
        { userId }
      );
    }

    if (profile.role !== 'influencer') {
      return failure(
        403,
        influencerErrorCodes.invalidRole,
        '인플루언서 권한이 없습니다',
        { role: profile.role }
      );
    }

    // 인플루언서 프로필 생성 또는 조회
    let influencerProfile: DatabaseInfluencerProfile;

    const { data: existingProfile } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!existingProfile) {
      // 프로필 생성
      const { data: newProfile, error: createError } = await supabase
        .from('influencer_profiles')
        .insert({
          user_id: userId,
          is_verified: false,
        })
        .select()
        .single();

      if (createError || !newProfile) {
        return failure(
          500,
          influencerErrorCodes.databaseError,
          '프로필 생성에 실패했습니다',
          createError
        );
      }
      influencerProfile = newProfile;
    } else {
      influencerProfile = existingProfile;
    }

    // 기존 채널 삭제
    const { error: deleteError } = await supabase
      .from('influencer_channels')
      .delete()
      .eq('influencer_id', influencerProfile.id);

    if (deleteError) {
      return failure(
        500,
        influencerErrorCodes.databaseError,
        '기존 채널 삭제에 실패했습니다',
        deleteError
      );
    }

    // 새 채널 추가
    if (data.channels.length > 0) {
      const channelsToInsert = data.channels.map(channel => ({
        influencer_id: influencerProfile.id,
        channel_type: channel.channelType,
        channel_name: channel.channelName,
        channel_url: channel.channelUrl,
        follower_count: channel.followerCount || 0,
        verification_status: channel.verificationStatus || 'pending',
      }));

      const { data: insertedChannels, error: insertError } = await supabase
        .from('influencer_channels')
        .insert(channelsToInsert)
        .select();

      if (insertError || !insertedChannels) {
        return failure(
          500,
          influencerErrorCodes.databaseError,
          '채널 등록에 실패했습니다',
          insertError
        );
      }

      // 채널이 1개 이상 등록되면 프로필 검증 완료 처리
      if (insertedChannels.length > 0 && !influencerProfile.is_verified) {
        const { error: verifyError } = await supabase
          .from('influencer_profiles')
          .update({ is_verified: true })
          .eq('id', influencerProfile.id);

        if (verifyError) {
          console.warn('Failed to verify influencer profile:', verifyError);
        } else {
          // 프로필 검증 상태 업데이트
          influencerProfile.is_verified = true;
        }
      }

      const response: ProfileResponse = {
        profileId: influencerProfile.id,
        userId: influencerProfile.user_id,
        isVerified: influencerProfile.is_verified,
        channels: insertedChannels.map(ch => ({
          id: ch.id,
          channelType: ch.channel_type as Channel['channelType'],
          channelName: ch.channel_name,
          channelUrl: ch.channel_url,
          followerCount: ch.follower_count,
          verificationStatus: ch.verification_status as Channel['verificationStatus'],
          createdAt: ch.created_at,
          updatedAt: ch.updated_at,
        })),
        createdAt: influencerProfile.created_at,
        updatedAt: influencerProfile.updated_at,
      };

      return success(response, 201);
    }

    const response: ProfileResponse = {
      profileId: influencerProfile.id,
      userId: influencerProfile.user_id,
      isVerified: influencerProfile.is_verified,
      channels: [],
      createdAt: influencerProfile.created_at,
      updatedAt: influencerProfile.updated_at,
    };

    return success(response, 201);
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.databaseError,
      '프로필 처리 중 오류가 발생했습니다',
      error
    );
  }
}

/**
 * 채널 추가
 */
export async function addChannel(
  supabase: SupabaseClient,
  userId: string,
  channel: Channel
): Promise<HandlerResult<{ channelId: string }, string>> {
  try {
    // 인플루언서 프로필 조회
    const { data: influencerProfile, error: profileError } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !influencerProfile) {
      return failure(
        404,
        influencerErrorCodes.profileNotFound,
        '인플루언서 프로필을 찾을 수 없습니다',
        { userId }
      );
    }

    // 현재 채널 수 확인
    const { count, error: countError } = await supabase
      .from('influencer_channels')
      .select('*', { count: 'exact', head: true })
      .eq('influencer_id', influencerProfile.id);

    if (countError) {
      return failure(
        500,
        influencerErrorCodes.databaseError,
        '채널 수를 확인하는데 실패했습니다',
        countError
      );
    }

    if (count !== null && count >= 10) {
      return failure(
        400,
        influencerErrorCodes.maxChannelsExceeded,
        '최대 10개까지 채널을 등록할 수 있습니다',
        { currentCount: count }
      );
    }

    // 중복 채널 확인
    const { data: existingChannel } = await supabase
      .from('influencer_channels')
      .select('id')
      .eq('influencer_id', influencerProfile.id)
      .eq('channel_url', channel.channelUrl)
      .single();

    if (existingChannel) {
      return failure(
        400,
        influencerErrorCodes.channelDuplicate,
        '이미 등록된 채널 URL입니다',
        { channelUrl: channel.channelUrl }
      );
    }

    // 채널 추가
    const { data: newChannel, error: insertError } = await supabase
      .from('influencer_channels')
      .insert({
        influencer_id: influencerProfile.id,
        channel_type: channel.channelType,
        channel_name: channel.channelName,
        channel_url: channel.channelUrl,
        follower_count: channel.followerCount || 0,
        verification_status: channel.verificationStatus || 'pending',
      })
      .select('id')
      .single();

    if (insertError || !newChannel) {
      return failure(
        500,
        influencerErrorCodes.databaseError,
        '채널 추가에 실패했습니다',
        insertError
      );
    }

    return success({ channelId: newChannel.id }, 201);
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.databaseError,
      '채널 추가 중 오류가 발생했습니다',
      error
    );
  }
}

/**
 * 채널 삭제
 */
export async function deleteChannel(
  supabase: SupabaseClient,
  userId: string,
  channelId: string
): Promise<HandlerResult<{ success: boolean }, string>> {
  try {
    // 인플루언서 프로필 조회
    const { data: influencerProfile, error: profileError } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !influencerProfile) {
      return failure(
        404,
        influencerErrorCodes.profileNotFound,
        '인플루언서 프로필을 찾을 수 없습니다',
        { userId }
      );
    }

    // 채널 소유권 확인 및 삭제
    const { data: deletedChannel, error: deleteError } = await supabase
      .from('influencer_channels')
      .delete()
      .eq('id', channelId)
      .eq('influencer_id', influencerProfile.id)
      .select()
      .single();

    if (deleteError || !deletedChannel) {
      return failure(
        404,
        influencerErrorCodes.channelNotFound,
        '채널을 찾을 수 없거나 권한이 없습니다',
        { channelId }
      );
    }

    return success({ success: true });
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.databaseError,
      '채널 삭제 중 오류가 발생했습니다',
      error
    );
  }
}

/**
 * 채널 중복 검증
 */
export async function validateChannelDuplication(
  supabase: SupabaseClient,
  userId: string,
  channelUrl: string
): Promise<HandlerResult<{ isDuplicate: boolean }, string>> {
  try {
    const { data: influencerProfile } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!influencerProfile) {
      return success({ isDuplicate: false });
    }

    const { data: existingChannel } = await supabase
      .from('influencer_channels')
      .select('id')
      .eq('influencer_id', influencerProfile.id)
      .eq('channel_url', channelUrl)
      .single();

    return success({ isDuplicate: !!existingChannel });
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.databaseError,
      '중복 검증 중 오류가 발생했습니다',
      error
    );
  }
}