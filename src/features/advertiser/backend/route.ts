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
  businessNumberParamSchema,
} from './schema';
import {
  getAdvertiserProfile,
  createOrUpdateProfile,
  checkBusinessNumberDuplicate,
} from './service';
import {
  advertiserErrorCodes,
} from './error';

export const registerAdvertiserRoutes = (app: Hono<AppEnv>) => {
  app.get('/advertiser/profile', async (c) => {
    const logger = getLogger(c);

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
          advertiserErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
          authError
        )
      );
    }

    const serviceSupabase = getSupabase(c);
    const result = await getAdvertiserProfile(serviceSupabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<string, unknown>;
      logger.error('Failed to fetch advertiser profile', errorResult.error.message);
    } else {
      logger.info('Successfully fetched advertiser profile', { userId: user.id, hasData: !!result.data });
    }

    return respond(c, result);
  });

  app.post('/advertiser/profile', async (c) => {
    const logger = getLogger(c);

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
          advertiserErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
          authError
        )
      );
    }

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
      logger.error('Failed to create/update advertiser profile', errorResult.error.message);
    }

    return respond(c, result);
  });

  app.get('/advertiser/business-number/:businessNumber/duplicate', async (c) => {
    const logger = getLogger(c);

    const parsedParams = businessNumberParamSchema.safeParse({
      businessNumber: c.req.param('businessNumber'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_BUSINESS_NUMBER',
          '유효한 사업자번호가 아닙니다',
          parsedParams.error.format()
        )
      );
    }

    const excludeUserId = c.req.query('excludeUserId');

    const serviceSupabase = getSupabase(c);
    const result = await checkBusinessNumberDuplicate(
      serviceSupabase,
      parsedParams.data.businessNumber,
      excludeUserId
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<string, unknown>;
      logger.error('Failed to check business number duplicate', errorResult.error.message);
    }

    return respond(c, result);
  });
};
