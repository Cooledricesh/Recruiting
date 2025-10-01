import type { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  createProfileRequestSchema,
  addChannelRequestSchema,
  channelIdParamSchema,
} from './schema';
import {
  getInfluencerProfile,
  createOrUpdateProfile,
  addChannel,
  deleteChannel,
} from './service';
import {
  influencerErrorCodes,
} from './error';

export const registerInfluencerRoutes = (app: Hono<AppEnv>) => {
  // 인플루언서 프로필 조회
  app.get('/influencer/profile', async (c) => {
    const logger = getLogger(c);

    // 인증 확인 (쿠키에서 Supabase 세션 확인)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return getCookie(c, name);
          },
          set(name: string, value: string, options: CookieOptions) {
            // 서버에서는 쿠키를 설정하지 않음
          },
          remove(name: string, options: CookieOptions) {
            // 서버에서는 쿠키를 제거하지 않음
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return respond(
        c,
        failure(
          401,
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
          authError
        )
      );
    }

    const serviceSupabase = getSupabase(c);
    const result = await getInfluencerProfile(serviceSupabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<string, unknown>;
      logger.error('Failed to fetch influencer profile', errorResult.error.message);
    }

    return respond(c, result);
  });

  // 인플루언서 프로필 생성/업데이트
  app.post('/influencer/profile', async (c) => {
    const logger = getLogger(c);

    // 인증 확인
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return getCookie(c, name);
          },
          set(name: string, value: string, options: CookieOptions) {
            // 서버에서는 쿠키를 설정하지 않음
          },
          remove(name: string, options: CookieOptions) {
            // 서버에서는 쿠키를 제거하지 않음
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return respond(
        c,
        failure(
          401,
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
          authError
        )
      );
    }

    // 요청 바디 파싱
    const body = await c.req.json();
    const parsedBody = createProfileRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REQUEST_BODY',
          '잘못된 요청 형식입니다',
          parsedBody.error.format()
        )
      );
    }

    const serviceSupabase = getSupabase(c);
    const result = await createOrUpdateProfile(
      serviceSupabase,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<string, unknown>;
      logger.error('Failed to create/update influencer profile', errorResult.error.message);
    }

    return respond(c, result);
  });

  // 채널 추가
  app.post('/influencer/channels', async (c) => {
    const logger = getLogger(c);

    // 인증 확인
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return getCookie(c, name);
          },
          set(name: string, value: string, options: CookieOptions) {
            // 서버에서는 쿠키를 설정하지 않음
          },
          remove(name: string, options: CookieOptions) {
            // 서버에서는 쿠키를 제거하지 않음
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return respond(
        c,
        failure(
          401,
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
          authError
        )
      );
    }

    // 요청 바디 파싱
    const body = await c.req.json();
    const parsedBody = addChannelRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REQUEST_BODY',
          '잘못된 요청 형식입니다',
          parsedBody.error.format()
        )
      );
    }

    const serviceSupabase = getSupabase(c);
    const result = await addChannel(
      serviceSupabase,
      user.id,
      parsedBody.data.channel
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<string, unknown>;
      logger.error('Failed to add channel', errorResult.error.message);
    }

    return respond(c, result);
  });

  // 채널 삭제
  app.delete('/influencer/channels/:channelId', async (c) => {
    const logger = getLogger(c);

    // 인증 확인
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return getCookie(c, name);
          },
          set(name: string, value: string, options: CookieOptions) {
            // 서버에서는 쿠키를 설정하지 않음
          },
          remove(name: string, options: CookieOptions) {
            // 서버에서는 쿠키를 제거하지 않음
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return respond(
        c,
        failure(
          401,
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
          authError
        )
      );
    }

    // 파라미터 파싱
    const parsedParams = channelIdParamSchema.safeParse({
      channelId: c.req.param('channelId'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CHANNEL_ID',
          '잘못된 채널 ID입니다',
          parsedParams.error.format()
        )
      );
    }

    const serviceSupabase = getSupabase(c);
    const result = await deleteChannel(
      serviceSupabase,
      user.id,
      parsedParams.data.channelId
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<string, unknown>;
      logger.error('Failed to delete channel', errorResult.error.message);
    }

    return respond(c, result);
  });
};