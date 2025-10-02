import { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  advertiserErrorCodes,
} from './error';
import type {
  CreateProfileRequest,
  ProfileResponse,
  BusinessNumberDuplicateResponse,
} from './schema';

interface DatabaseAdvertiserProfile {
  id: string;
  user_id: string;
  company_name: string;
  address: string;
  location: string;
  store_phone: string;
  category: string;
  business_number: string;
  representative_name: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 광고주 프로필 조회
 */
export async function getAdvertiserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<HandlerResult<ProfileResponse, string>> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return failure(
        404,
        advertiserErrorCodes.userNotFound,
        '사용자를 찾을 수 없습니다',
        { userId }
      );
    }

    if (profile.role !== 'advertiser') {
      return failure(
        403,
        advertiserErrorCodes.invalidRole,
        '광고주 권한이 없습니다',
        { role: profile.role }
      );
    }

    const { data: advertiserProfile, error: advertiserError } = await supabase
      .from('advertiser_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (advertiserError || !advertiserProfile) {
      return failure(
        404,
        advertiserErrorCodes.profileNotFound,
        '광고주 프로필을 찾을 수 없습니다',
        { userId }
      );
    }

    const dbProfile = advertiserProfile as DatabaseAdvertiserProfile;

    const response: ProfileResponse = {
      profileId: dbProfile.id,
      userId: dbProfile.user_id,
      companyName: dbProfile.company_name,
      address: dbProfile.address,
      location: dbProfile.location,
      storePhone: dbProfile.store_phone,
      category: dbProfile.category,
      businessNumber: dbProfile.business_number,
      representativeName: dbProfile.representative_name,
      isVerified: dbProfile.is_verified,
      createdAt: dbProfile.created_at,
      updatedAt: dbProfile.updated_at,
    };

    return success(response);
  } catch (error) {
    return failure(
      500,
      advertiserErrorCodes.databaseError,
      '프로필 조회 중 오류가 발생했습니다',
      error
    );
  }
}

/**
 * 광고주 프로필 생성 또는 업데이트
 */
export async function createOrUpdateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: CreateProfileRequest
): Promise<HandlerResult<ProfileResponse, string>> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return failure(
        404,
        advertiserErrorCodes.userNotFound,
        '사용자를 찾을 수 없습니다',
        { userId }
      );
    }

    if (profile.role !== 'advertiser') {
      return failure(
        403,
        advertiserErrorCodes.invalidRole,
        '광고주 권한이 없습니다',
        { role: profile.role }
      );
    }

    const duplicateCheck = await checkBusinessNumberDuplicate(
      supabase,
      data.businessNumber,
      userId
    );

    if (!duplicateCheck.ok) {
      return duplicateCheck as HandlerResult<ProfileResponse, string>;
    }

    if (duplicateCheck.data.isDuplicate) {
      return failure(
        409,
        advertiserErrorCodes.businessNumberDuplicate,
        '이미 등록된 사업자번호입니다',
        { businessNumber: data.businessNumber }
      );
    }

    const { data: existingProfile } = await supabase
      .from('advertiser_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let advertiserProfile: DatabaseAdvertiserProfile;

    if (!existingProfile) {
      const { data: newProfile, error: createError } = await supabase
        .from('advertiser_profiles')
        .insert({
          user_id: userId,
          company_name: data.companyName,
          address: data.address,
          location: data.location,
          store_phone: data.storePhone,
          category: data.category,
          business_number: data.businessNumber,
          representative_name: data.representativeName,
          is_verified: true,
        })
        .select()
        .single();

      if (createError || !newProfile) {
        return failure(
          500,
          advertiserErrorCodes.databaseError,
          '프로필 생성에 실패했습니다',
          createError
        );
      }
      advertiserProfile = newProfile as DatabaseAdvertiserProfile;
    } else {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('advertiser_profiles')
        .update({
          company_name: data.companyName,
          address: data.address,
          location: data.location,
          store_phone: data.storePhone,
          category: data.category,
          business_number: data.businessNumber,
          representative_name: data.representativeName,
          is_verified: true,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError || !updatedProfile) {
        return failure(
          500,
          advertiserErrorCodes.databaseError,
          '프로필 업데이트에 실패했습니다',
          updateError
        );
      }
      advertiserProfile = updatedProfile as DatabaseAdvertiserProfile;
    }

    const response: ProfileResponse = {
      profileId: advertiserProfile.id,
      userId: advertiserProfile.user_id,
      companyName: advertiserProfile.company_name,
      address: advertiserProfile.address,
      location: advertiserProfile.location,
      storePhone: advertiserProfile.store_phone,
      category: advertiserProfile.category,
      businessNumber: advertiserProfile.business_number,
      representativeName: advertiserProfile.representative_name,
      isVerified: advertiserProfile.is_verified,
      createdAt: advertiserProfile.created_at,
      updatedAt: advertiserProfile.updated_at,
    };

    return success(response, existingProfile ? 200 : 201);
  } catch (error) {
    return failure(
      500,
      advertiserErrorCodes.databaseError,
      '프로필 처리 중 오류가 발생했습니다',
      error
    );
  }
}

/**
 * 사업자번호 중복 확인
 */
export async function checkBusinessNumberDuplicate(
  supabase: SupabaseClient,
  businessNumber: string,
  excludeUserId?: string
): Promise<HandlerResult<BusinessNumberDuplicateResponse, string>> {
  try {
    let query = supabase
      .from('advertiser_profiles')
      .select('id, user_id')
      .eq('business_number', businessNumber);

    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      return failure(
        500,
        advertiserErrorCodes.databaseError,
        '중복 확인 중 오류가 발생했습니다',
        error
      );
    }

    return success({ isDuplicate: !!data });
  } catch (error) {
    return failure(
      500,
      advertiserErrorCodes.databaseError,
      '중복 확인 중 오류가 발생했습니다',
      error
    );
  }
}
