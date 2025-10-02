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
import { MyApplicationsQuerySchema } from './schema';
import { getMyApplications } from './service';
import {
  applicationErrorCodes,
  type ApplicationServiceError,
} from './error';

export const registerApplicationRoutes = (app: Hono<AppEnv>) => {
  app.get('/my/applications', async (c) => {
    const authSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return getCookie(c, name);
          },
          set(_name: string, _value: string, _options: CookieOptions) {
            // 서버에서는 쿠키를 설정하지 않음
          },
          remove(_name: string, _options: CookieOptions) {
            // 서버에서는 쿠키를 제거하지 않음
          },
        },
      }
    );

    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '로그인이 필요합니다')
      );
    }

    const queryParams = c.req.query();
    const parsedQuery = MyApplicationsQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidParams,
          'Invalid query parameters',
          parsedQuery.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getMyApplications(
      supabase,
      user.id,
      parsedQuery.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<ApplicationServiceError, unknown>;

      if (errorResult.error.code === applicationErrorCodes.influencerNotFound) {
        logger.warn('Influencer profile not found', { userId: user.id });
      } else if (errorResult.error.code === applicationErrorCodes.fetchError) {
        logger.error('Failed to fetch applications', errorResult.error.message);
      }
    }

    return respond(c, result);
  });
};
