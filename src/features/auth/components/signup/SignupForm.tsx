"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { RoleSelector } from './RoleSelector';
import { TermsAgreement } from './TermsAgreement';
import { useSignup } from '@/features/auth/hooks/useSignup';
import { useEmailCheck } from '@/features/auth/hooks/useEmailCheck';

import {
  formatPhoneNumber,
  handlePhoneInput,
  getPhoneValidationMessage,
} from '@/lib/validation/phone';
import {
  getBirthDateValidationMessage,
  getBirthDateRange,
} from '@/lib/validation/birthdate';
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '@/lib/validation/password';

// 폼 스키마 정의
const signupFormSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Z]/, '최소 1개의 대문자를 포함해야 합니다')
    .regex(/[a-z]/, '최소 1개의 소문자를 포함해야 합니다')
    .regex(/[0-9]/, '최소 1개의 숫자를 포함해야 합니다'),
  confirmPassword: z.string(),
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이내여야 합니다'),
  birthDate: z.string().refine((val) => {
    const msg = getBirthDateValidationMessage(val);
    return msg === null;
  }, '유효한 생년월일을 입력해주세요'),
  phone: z.string().refine((val) => {
    const msg = getPhoneValidationMessage(val);
    return msg === null;
  }, '유효한 휴대폰번호를 입력해주세요'),
  role: z.enum(['advertiser', 'influencer'], {
    errorMap: () => ({ message: '역할을 선택해주세요' }),
  }),
  termsAgreed: z.array(z.string()).refine((val) => {
    // 필수 약관 확인
    return val.includes('service') && val.includes('privacy') && val.includes('age');
  }, '필수 약관에 모두 동의해야 합니다'),
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      birthDate: '',
      phone: '',
      termsAgreed: [],
    },
  });

  const { mutate: signup, isPending: isSubmitting } = useSignup();
  const { mutate: checkEmail, isPending: isCheckingEmail } = useEmailCheck();

  const watchPassword = watch('password');
  const watchEmail = watch('email');
  const birthDateRange = getBirthDateRange();

  // 이메일 중복 체크 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchEmail && watchEmail.includes('@')) {
        checkEmail(
          { email: watchEmail },
          {
            onSuccess: (data) => {
              if (!data.available) {
                setError('email', {
                  type: 'manual',
                  message: '이미 사용 중인 이메일입니다',
                });
              } else {
                clearErrors('email');
              }
            },
          }
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchEmail, checkEmail, setError, clearErrors]);

  const onSubmit = async (data: SignupFormData) => {
    // 약관 동의 데이터 변환
    const termsData = data.termsAgreed.map(type => ({
      type: type as 'service' | 'privacy' | 'marketing' | 'age',
      version: '1.0.0',
      agreedAt: new Date().toISOString(),
    }));

    const signupData = {
      ...data,
      authMethod: 'email' as const,
      termsAgreed: termsData,
    };

    signup(signupData, {
      onSuccess: (response) => {
        if (response.success) {
          // 이메일 인증 필요 알림 페이지로 이동
          router.push('/auth/verify-email');
        }
      },
      onError: (error: any) => {
        // 에러 처리
        const errorMessage = error?.response?.data?.message || '회원가입에 실패했습니다';
        setError('root', {
          type: 'manual',
          message: errorMessage,
        });
      },
    });
  };

  const passwordStrength = watchPassword ? getPasswordStrength(watchPassword) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기본 정보</h3>

        {/* 이메일 */}
        <div className="space-y-2">
          <Label htmlFor="email">
            이메일 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              {...register('email')}
              className={cn(errors.email && 'border-red-500')}
            />
            {isCheckingEmail && (
              <div className="absolute right-3 top-3">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="space-y-2">
          <Label htmlFor="password">
            비밀번호 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="8자 이상, 대소문자 및 숫자 포함"
              autoComplete="new-password"
              {...register('password')}
              className={cn(errors.password && 'border-red-500')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordStrength && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">비밀번호 강도:</span>
              <span
                className={cn(
                  'rounded px-2 py-1 text-xs font-medium',
                  getPasswordStrengthColor(passwordStrength)
                )}
              >
                {getPasswordStrengthLabel(passwordStrength)}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            비밀번호 확인 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력해주세요"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={cn(errors.confirmPassword && 'border-red-500')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* 이름 */}
        <div className="space-y-2">
          <Label htmlFor="name">
            이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="실명을 입력해주세요"
            autoComplete="name"
            {...register('name')}
            className={cn(errors.name && 'border-red-500')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* 생년월일 */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">
            생년월일 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="birthDate"
            type="date"
            min={birthDateRange.min}
            max={birthDateRange.max}
            {...register('birthDate')}
            className={cn(errors.birthDate && 'border-red-500')}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-600">{errors.birthDate.message}</p>
          )}
        </div>

        {/* 휴대폰번호 */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            휴대폰번호 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="010-0000-0000"
            autoComplete="tel"
            {...register('phone', {
              onChange: (e) => {
                const formatted = handlePhoneInput(e.target.value);
                setValue('phone', formatted);
              },
            })}
            className={cn(errors.phone && 'border-red-500')}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* 역할 선택 */}
      <RoleSelector
        value={watch('role')}
        onChange={(value) => setValue('role', value)}
        error={errors.role?.message}
      />

      {/* 약관 동의 */}
      <TermsAgreement
        value={watch('termsAgreed')}
        onChange={(value) => setValue('termsAgreed', value)}
        error={errors.termsAgreed?.message}
      />

      {/* 에러 메시지 */}
      {errors.root && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            회원가입 중...
          </>
        ) : (
          '회원가입'
        )}
      </Button>

      {/* 로그인 링크 */}
      <div className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          로그인
        </Link>
      </div>
    </form>
  );
}