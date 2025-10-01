"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { UserCircle2, Store } from 'lucide-react';

export interface RoleSelectorProps {
  value?: 'advertiser' | 'influencer';
  onChange: (value: 'advertiser' | 'influencer') => void;
  error?: string;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, error, disabled }: RoleSelectorProps) {
  const roles = [
    {
      id: 'advertiser',
      label: '광고주',
      description: '체험단을 모집하고 관리합니다',
      icon: Store,
    },
    {
      id: 'influencer',
      label: '인플루언서',
      description: '체험단에 지원하고 활동합니다',
      icon: UserCircle2,
    },
  ] as const;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        역할 선택 <span className="text-red-500">*</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => !disabled && onChange(role.id as 'advertiser' | 'influencer')}
              disabled={disabled}
              className={cn(
                'relative flex flex-col items-center rounded-lg border-2 p-6 transition-all',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              aria-pressed={isSelected}
            >
              <Icon
                className={cn(
                  'mb-3 h-12 w-12',
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'mb-1 text-base font-medium',
                  isSelected ? 'text-blue-900' : 'text-gray-900'
                )}
              >
                {role.label}
              </span>
              <span
                className={cn(
                  'text-center text-sm',
                  isSelected ? 'text-blue-700' : 'text-gray-500'
                )}
              >
                {role.description}
              </span>
              {isSelected && (
                <div className="absolute right-2 top-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}