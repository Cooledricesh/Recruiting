import type { Hono } from 'hono';
import { respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { testDatabaseConnection } from './service';
import {
  dbTestErrorCodes,
  type DbTestServiceError,
} from './error';

export const registerDbTestRoutes = (app: Hono<AppEnv>) => {
  app.get('/db-test', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    logger.info('Testing database connection...');

    const result = await testDatabaseConnection(supabase);

    if (!result.ok) {
      const errorResult = result as ErrorResult<DbTestServiceError, unknown>;

      if (errorResult.error.code === dbTestErrorCodes.connectionError) {
        logger.error('Database connection failed', errorResult.error.message);
      } else if (errorResult.error.code === dbTestErrorCodes.queryError) {
        logger.error('Database query failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Database connection test successful');
    return respond(c, result);
  });
};
