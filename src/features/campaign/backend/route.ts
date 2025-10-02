import type { Hono } from 'hono';
import { z } from 'zod';
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
import { CampaignListQuerySchema } from './schema';
import { getCampaignList, getCampaignDetail } from './service';
import {
  campaignErrorCodes,
  type CampaignServiceError,
} from './error';

export const registerCampaignRoutes = (app: Hono<AppEnv>) => {
  app.get('/campaigns', async (c) => {
    const queryParams = c.req.query();

    const parsedQuery = CampaignListQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.invalidParams,
          'Invalid query parameters',
          parsedQuery.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCampaignList(supabase, parsedQuery.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.fetchError) {
        logger.error('Failed to fetch campaigns', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get('/campaigns/:id', async (c) => {
    const campaignId = c.req.param('id');

    const parsedId = z.string().uuid().safeParse(campaignId);
    if (!parsedId.success) {
      return respond(
        c,
        failure(400, campaignErrorCodes.invalidParams, 'Invalid campaign ID')
      );
    }

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
    const userId = user?.id ?? null;

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCampaignDetail(supabase, parsedId.data, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.notFound) {
        logger.warn('Campaign not found', { campaignId: parsedId.data });
      } else {
        logger.error('Failed to fetch campaign detail', errorResult.error.message);
      }
    }

    return respond(c, result);
  });
};
