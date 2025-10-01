import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerDbTestRoutes } from '@/features/db-test/backend/route';
import { registerSignupRoutes } from '@/features/auth/backend/signup/route';
import { registerInfluencerRoutes } from '@/features/influencer/backend/route';
import { registerAdvertiserRoutes } from '@/features/advertiser/backend/route';
import { registerCampaignRoutes } from '@/features/campaign/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>({ strict: false }).basePath('/api');

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerDbTestRoutes(app);
  registerSignupRoutes(app);
  registerInfluencerRoutes(app);
  registerAdvertiserRoutes(app);
  registerCampaignRoutes(app);

  singletonApp = app;

  return app;
};
