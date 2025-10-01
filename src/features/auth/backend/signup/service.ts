import { SupabaseClient } from '@supabase/supabase-js';
import { SignupError, SignupErrorCodes } from './error';
import type {
  SignupRequest,
  SignupResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  TermsAgreement,
} from './schema';

export class SignupService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * 회원가입 처리
   */
  async createUser(data: SignupRequest): Promise<SignupResponse> {
    try {
      // 1. 필수 약관 동의 확인
      this.validateRequiredTerms(data.termsAgreed);

      // 2. 이메일 중복 확인
      const emailAvailable = await this.checkEmailAvailability(data.email);
      if (!emailAvailable) {
        throw new SignupError(SignupErrorCodes.EMAIL_ALREADY_EXISTS);
      }

      // 3. 이메일 인증 방식인 경우 비밀번호 필수
      if (data.authMethod === 'email' && !data.password) {
        throw new SignupError(SignupErrorCodes.PASSWORD_REQUIRED);
      }

      // 4. Supabase Auth 계정 생성
      let userId: string | null = null;

      if (data.authMethod === 'email' && data.password) {
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
            },
          },
        });

        if (authError) {
          console.error('Auth signup error:', authError);
          if (authError.message?.includes('already registered')) {
            throw new SignupError(SignupErrorCodes.EMAIL_ALREADY_EXISTS);
          }
          throw new SignupError(SignupErrorCodes.DATABASE_ERROR, authError.message);
        }

        userId = authData.user?.id || null;
      } else {
        // OAuth 인증의 경우 별도 처리 (프론트엔드에서 처리)
        return {
          success: false,
          requiresEmailVerification: false,
          message: 'OAuth 인증은 클라이언트에서 처리해주세요',
        };
      }

      if (!userId) {
        throw new SignupError(SignupErrorCodes.DATABASE_ERROR, '사용자 ID를 생성할 수 없습니다');
      }

      // 5. profiles 테이블에 기본 정보 저장
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          name: data.name,
          phone: data.phone.replace(/-/g, ''), // 하이픈 제거
          email: data.email,
          birth_date: data.birthDate,
          role: data.role,
          terms_agreed_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Auth 계정 롤백 시도
        await this.rollbackAuthUser(userId);
        throw new SignupError(SignupErrorCodes.PROFILE_CREATION_FAILED, profileError.message);
      }

      // 6. 약관 동의 이력 저장
      await this.saveTermsHistory(userId, data.termsAgreed, data.ipAddress, data.userAgent);

      // 7. 역할별 리다이렉트 URL 결정
      const redirectUrl = data.role === 'advertiser'
        ? '/onboarding/advertiser'
        : '/onboarding/influencer';

      return {
        success: true,
        userId,
        requiresEmailVerification: true,
        redirectUrl,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      };
    } catch (error) {
      if (error instanceof SignupError) {
        throw error;
      }
      console.error('Unexpected error during signup:', error);
      throw new SignupError(SignupErrorCodes.INTERNAL_ERROR);
    }
  }

  /**
   * 이메일 중복 확인
   */
  async checkEmail(data: CheckEmailRequest): Promise<CheckEmailResponse> {
    try {
      const available = await this.checkEmailAvailability(data.email);
      return {
        available,
        message: available
          ? '사용 가능한 이메일입니다'
          : '이미 사용 중인 이메일입니다',
      };
    } catch (error) {
      console.error('Email check error:', error);
      throw new SignupError(SignupErrorCodes.DATABASE_ERROR);
    }
  }

  /**
   * 이메일 인증 확인
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    try {
      // Supabase의 기본 이메일 인증 처리
      const { data: sessionData, error } = await this.supabase.auth.verifyOtp({
        token_hash: data.token,
        type: data.type === 'signup' ? 'signup' : 'recovery',
      });

      if (error) {
        console.error('Email verification error:', error);
        throw new SignupError(SignupErrorCodes.EMAIL_VERIFICATION_FAILED, error.message);
      }

      if (!sessionData.user) {
        throw new SignupError(SignupErrorCodes.INVALID_VERIFICATION_TOKEN);
      }

      // 사용자 역할 조회
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      const role = profile?.role as 'advertiser' | 'influencer' | undefined;
      const redirectUrl = role === 'advertiser'
        ? '/onboarding/advertiser'
        : role === 'influencer'
        ? '/onboarding/influencer'
        : '/dashboard';

      return {
        success: true,
        message: '이메일 인증이 완료되었습니다',
        redirectUrl,
        role,
      };
    } catch (error) {
      if (error instanceof SignupError) {
        throw error;
      }
      console.error('Unexpected error during email verification:', error);
      throw new SignupError(SignupErrorCodes.EMAIL_VERIFICATION_FAILED);
    }
  }

  /**
   * 이메일 사용 가능 여부 확인 (내부 메서드)
   */
  private async checkEmailAvailability(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Email check error:', error);
      throw new SignupError(SignupErrorCodes.DATABASE_ERROR);
    }

    return !data;
  }

  /**
   * 필수 약관 동의 확인
   */
  private validateRequiredTerms(termsAgreed: TermsAgreement[]): void {
    const requiredTerms = ['service', 'privacy'];
    const agreedTypes = termsAgreed.map(term => term.type);

    const missingTerms = requiredTerms.filter(term => !agreedTypes.includes(term as any));
    if (missingTerms.length > 0) {
      throw new SignupError(SignupErrorCodes.REQUIRED_TERMS_MISSING);
    }
  }

  /**
   * 약관 동의 이력 저장
   */
  private async saveTermsHistory(
    userId: string,
    termsAgreed: TermsAgreement[],
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const termsRecords = termsAgreed.map(term => ({
      user_id: userId,
      terms_type: term.type,
      terms_version: term.version || '1.0.0',
      agreed_at: term.agreedAt || new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    }));

    const { error } = await this.supabase
      .from('terms_history')
      .insert(termsRecords);

    if (error) {
      console.error('Terms history save error:', error);
      // 약관 저장 실패는 치명적이지 않으므로 경고만 로그
      console.warn('Failed to save terms history, but continuing with signup');
    }
  }

  /**
   * Auth 사용자 롤백 (트랜잭션 실패 시)
   */
  private async rollbackAuthUser(userId: string): Promise<void> {
    try {
      // Supabase Admin API를 통한 사용자 삭제
      // 주의: 이 작업은 service role key가 필요함
      const { error } = await this.supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error('Failed to rollback auth user:', error);
      }
    } catch (error) {
      console.error('Error during auth user rollback:', error);
    }
  }
}