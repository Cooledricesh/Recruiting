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
import { CampaignListQuerySchema, ApplicationRequestSchema, CreateCampaignRequestSchema, SelectApplicantsRequestSchema } from './schema';
import { getCampaignList, getCampaignDetail, createApplication, getAdvertiserCampaigns, createCampaign, getAdvertiserCampaignDetail, closeCampaign, selectApplicants } from './service';
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

  app.post('/campaigns/:id/apply', async (c) => {
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

    if (!user) {
      return respond(
        c,
        failure(401, campaignErrorCodes.validationError, '로그인이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = ApplicationRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          'Invalid request body',
          parsedBody.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createApplication(
      supabase,
      parsedId.data,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.alreadyApplied) {
        logger.warn('Duplicate application attempt', {
          campaignId: parsedId.data,
          userId: user.id
        });
      } else if (errorResult.error.code === campaignErrorCodes.recruitmentClosed) {
        logger.warn('Application to closed campaign', {
          campaignId: parsedId.data
        });
      } else {
        logger.error('Failed to create application', errorResult.error.message);
      }
    } else {
      logger.info('Application created successfully', {
        campaignId: parsedId.data,
        userId: user.id
      });
    }

    return respond(c, result);
  });

  app.get('/advertiser/campaigns', async (c) => {
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
        failure(401, campaignErrorCodes.validationError, '로그인이 필요합니다')
      );
    }

    const queryParams = c.req.query();
    const parsedQuery = CampaignListQuerySchema.pick({
      status: true,
      sort: true,
      page: true,
      limit: true,
    }).safeParse(queryParams);

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

    const result = await getAdvertiserCampaigns(
      supabase,
      user.id,
      parsedQuery.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.advertiserNotFound) {
        logger.warn('Advertiser profile not found', { userId: user.id });
      } else if (errorResult.error.code === campaignErrorCodes.advertiserNotVerified) {
        logger.warn('Advertiser not verified', { userId: user.id });
      } else {
        logger.error('Failed to fetch advertiser campaigns', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.post('/advertiser/campaigns', async (c) => {
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
        failure(401, campaignErrorCodes.validationError, '로그인이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateCampaignRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          'Invalid request body',
          parsedBody.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createCampaign(
      supabase,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.advertiserNotFound) {
        logger.warn('Advertiser profile not found', { userId: user.id });
      } else if (errorResult.error.code === campaignErrorCodes.advertiserNotVerified) {
        logger.warn('Advertiser not verified', { userId: user.id });
      } else if (errorResult.error.code === campaignErrorCodes.invalidDateRange) {
        logger.warn('Invalid date range', parsedBody.data);
      } else {
        logger.error('Failed to create campaign', errorResult.error.message);
      }
    } else {
      logger.info('Campaign created successfully', { userId: user.id });
    }

    return respond(c, result);
  });

  app.get('/advertiser/campaigns/:id', async (c) => {
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

    if (!user) {
      return respond(
        c,
        failure(401, campaignErrorCodes.validationError, '로그인이 필요합니다')
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getAdvertiserCampaignDetail(
      supabase,
      user.id,
      parsedId.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.notFound) {
        logger.warn('Campaign not found', { campaignId: parsedId.data });
      } else if (errorResult.error.code === campaignErrorCodes.unauthorizedAccess) {
        logger.warn('Unauthorized campaign access', { userId: user.id, campaignId: parsedId.data });
      } else {
        logger.error('Failed to fetch advertiser campaign detail', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.put('/advertiser/campaigns/:id/close', async (c) => {
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

    if (!user) {
      return respond(
        c,
        failure(401, campaignErrorCodes.validationError, '로그인이 필요합니다')
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await closeCampaign(
      supabase,
      user.id,
      parsedId.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.alreadyClosed) {
        logger.warn('Campaign already closed', { campaignId: parsedId.data });
      } else if (errorResult.error.code === campaignErrorCodes.unauthorizedAccess) {
        logger.warn('Unauthorized campaign close', { userId: user.id, campaignId: parsedId.data });
      } else {
        logger.error('Failed to close campaign', errorResult.error.message);
      }
    } else {
      logger.info('Campaign closed successfully', { userId: user.id, campaignId: parsedId.data });
    }

    return respond(c, result);
  });

  app.post('/advertiser/campaigns/:id/select', async (c) => {
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

    if (!user) {
      return respond(
        c,
        failure(401, campaignErrorCodes.validationError, '로그인이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = SelectApplicantsRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          'Invalid request body',
          parsedBody.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await selectApplicants(
      supabase,
      user.id,
      parsedId.data,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.notClosedYet) {
        logger.warn('Cannot select applicants - campaign not closed', { campaignId: parsedId.data });
      } else if (errorResult.error.code === campaignErrorCodes.alreadySelected) {
        logger.warn('Campaign already selected', { campaignId: parsedId.data });
      } else if (errorResult.error.code === campaignErrorCodes.invalidSelection) {
        logger.warn('Invalid applicant selection', { campaignId: parsedId.data });
      } else if (errorResult.error.code === campaignErrorCodes.unauthorizedAccess) {
        logger.warn('Unauthorized applicant selection', { userId: user.id, campaignId: parsedId.data });
      } else {
        logger.error('Failed to select applicants', errorResult.error.message);
      }
    } else {
      logger.info('Applicants selected successfully', { userId: user.id, campaignId: parsedId.data });
    }

    return respond(c, result);
  });
};
