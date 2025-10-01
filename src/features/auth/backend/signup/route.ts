import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';
import { SignupService } from './service';
import {
  signupRequestSchema,
  checkEmailRequestSchema,
  verifyEmailRequestSchema,
} from './schema';
import { SignupError, SignupErrorCodes } from './error';

export function registerSignupRoutes(app: Hono<AppEnv>) {
  const authGroup = new Hono<AppEnv>();

  /**
   * POST /api/auth/signup
   * 회원가입 처리
   */
  authGroup.post('/signup', async (c) => {
    try {
      // IP 주소와 User-Agent 가져오기
      const ipAddress = c.req.header('x-forwarded-for') ||
                       c.req.header('x-real-ip') ||
                       '0.0.0.0';
      const userAgent = c.req.header('user-agent');

      // 요청 본문 파싱
      const body = await c.req.json();

      // 메타데이터 추가
      const requestData = {
        ...body,
        ipAddress,
        userAgent,
      };

      // 유효성 검사
      const validatedData = signupRequestSchema.parse(requestData);

      // 서비스 호출
      const supabase = c.get('supabase');
      const service = new SignupService(supabase);
      const result = await service.createUser(validatedData);

      // 성공 응답
      return respond(c, success(result, result.success ? 201 : 200));
    } catch (error) {
      // 에러 처리
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return respond(c, failure(
          400,
          SignupErrorCodes.VALIDATION_ERROR,
          firstError.message,
          error.errors
        ));
      }

      if (error instanceof SignupError) {
        return respond(c, failure(
          error.statusCode as any,
          error.code,
          error.message
        ));
      }

      // 예상치 못한 에러
      const logger = c.get('logger');
      logger.error('Unexpected error during signup:', error);

      return respond(c, failure(
        500,
        SignupErrorCodes.INTERNAL_ERROR,
        '회원가입 처리 중 오류가 발생했습니다'
      ));
    }
  });

  /**
   * POST /api/auth/check-email
   * 이메일 중복 확인
   */
  authGroup.post('/check-email', async (c) => {
    try {
      // 요청 본문 파싱
      const body = await c.req.json();

      // 유효성 검사
      const validatedData = checkEmailRequestSchema.parse(body);

      // 서비스 호출
      const supabase = c.get('supabase');
      const service = new SignupService(supabase);
      const result = await service.checkEmail(validatedData);

      // 성공 응답
      return respond(c, success(result, 200));
    } catch (error) {
      // 에러 처리
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return respond(c, failure(
          400,
          SignupErrorCodes.INVALID_EMAIL_FORMAT,
          firstError.message
        ));
      }

      if (error instanceof SignupError) {
        return respond(c, failure(
          error.statusCode as any,
          error.code,
          error.message
        ));
      }

      // 예상치 못한 에러
      const logger = c.get('logger');
      logger.error('Unexpected error during email check:', error);

      return respond(c, failure(
        500,
        SignupErrorCodes.INTERNAL_ERROR,
        '이메일 확인 중 오류가 발생했습니다'
      ));
    }
  });

  /**
   * GET /api/auth/verify
   * 이메일 인증 확인
   */
  authGroup.get('/verify', async (c) => {
    try {
      // 쿼리 파라미터 가져오기
      const token = c.req.query('token');
      const type = c.req.query('type') || 'signup';

      if (!token) {
        return respond(c, failure(
          400,
          SignupErrorCodes.INVALID_VERIFICATION_TOKEN,
          '인증 토큰이 필요합니다'
        ));
      }

      // 유효성 검사
      const validatedData = verifyEmailRequestSchema.parse({ token, type });

      // 서비스 호출
      const supabase = c.get('supabase');
      const service = new SignupService(supabase);
      const result = await service.verifyEmail(validatedData);

      // 성공 응답
      return respond(c, success(result, 200));
    } catch (error) {
      // 에러 처리
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return respond(c, failure(
          400,
          SignupErrorCodes.VALIDATION_ERROR,
          firstError.message
        ));
      }

      if (error instanceof SignupError) {
        return respond(c, failure(
          error.statusCode as any,
          error.code,
          error.message
        ));
      }

      // 예상치 못한 에러
      const logger = c.get('logger');
      logger.error('Unexpected error during email verification:', error);

      return respond(c, failure(
        500,
        SignupErrorCodes.EMAIL_VERIFICATION_FAILED,
        '이메일 인증 처리 중 오류가 발생했습니다'
      ));
    }
  });

  /**
   * POST /api/auth/verify
   * 이메일 인증 확인 (POST 방식)
   */
  authGroup.post('/verify', async (c) => {
    try {
      // 요청 본문 파싱
      const body = await c.req.json();

      // 유효성 검사
      const validatedData = verifyEmailRequestSchema.parse(body);

      // 서비스 호출
      const supabase = c.get('supabase');
      const service = new SignupService(supabase);
      const result = await service.verifyEmail(validatedData);

      // 성공 응답
      return respond(c, success(result, 200));
    } catch (error) {
      // 에러 처리
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return respond(c, failure(
          400,
          SignupErrorCodes.VALIDATION_ERROR,
          firstError.message
        ));
      }

      if (error instanceof SignupError) {
        return respond(c, failure(
          error.statusCode as any,
          error.code,
          error.message
        ));
      }

      // 예상치 못한 에러
      const logger = c.get('logger');
      logger.error('Unexpected error during email verification:', error);

      return respond(c, failure(
        500,
        SignupErrorCodes.EMAIL_VERIFICATION_FAILED,
        '이메일 인증 처리 중 오류가 발생했습니다'
      ));
    }
  });

  // 라우트 그룹 마운트
  app.route('/auth', authGroup);
}