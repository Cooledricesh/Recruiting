import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type { DbTestResponse } from '@/features/db-test/backend/schema';
import {
  dbTestErrorCodes,
  type DbTestServiceError,
} from '@/features/db-test/backend/error';

export const testDatabaseConnection = async (
  client: SupabaseClient,
): Promise<HandlerResult<DbTestResponse, DbTestServiceError, unknown>> => {
  try {
    // 1. 기본 연결 테스트: profiles 테이블 카운트 조회
    const { count: profilesCount, error: countError } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return failure(
        500,
        dbTestErrorCodes.queryError,
        `Failed to query profiles table: ${countError.message}`,
        countError,
      );
    }

    // 2. 테이블 목록 조회 (public 스키마의 테이블들)
    const { data: tablesData, error: tablesError } = await client.rpc(
      'get_table_names',
      {},
    );

    // RPC가 없을 경우를 대비해 에러 무시하고 기본 테이블 목록 제공
    const tables = tablesError
      ? [
          'profiles',
          'influencer_profiles',
          'influencer_channels',
          'advertiser_profiles',
          'campaigns',
          'applications',
        ]
      : tablesData;

    // 3. profiles 테이블 샘플 데이터 조회 (최대 3개)
    const { data: sampleData, error: sampleError } = await client
      .from('profiles')
      .select('id, name, email, role, created_at')
      .limit(3);

    if (sampleError) {
      return failure(
        500,
        dbTestErrorCodes.queryError,
        `Failed to fetch sample data: ${sampleError.message}`,
        sampleError,
      );
    }

    const response: DbTestResponse = {
      status: 'connected',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      tables,
      sampleData: {
        tableName: 'profiles',
        count: profilesCount ?? 0,
        sample: sampleData ?? [],
      },
    };

    return success(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return failure(
      500,
      dbTestErrorCodes.connectionError,
      `Database connection failed: ${errorMessage}`,
      error,
    );
  }
};
