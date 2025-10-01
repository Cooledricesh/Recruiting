"use client";

import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface TermItem {
  type: 'service' | 'privacy' | 'marketing' | 'age';
  label: string;
  required: boolean;
  link?: string;
}

export interface TermsAgreementProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

const TERMS_LIST: TermItem[] = [
  {
    type: 'service',
    label: '서비스 이용약관',
    required: true,
    link: '/terms/service',
  },
  {
    type: 'privacy',
    label: '개인정보 처리방침',
    required: true,
    link: '/terms/privacy',
  },
  {
    type: 'marketing',
    label: '마케팅 정보 수신',
    required: false,
    link: '/terms/marketing',
  },
  {
    type: 'age',
    label: '만 14세 이상 확인',
    required: true,
  },
];

export function TermsAgreement({ value, onChange, error, disabled }: TermsAgreementProps) {
  const [allChecked, setAllChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    const checkedCount = value.length;
    const totalCount = TERMS_LIST.length;

    setAllChecked(checkedCount === totalCount);
    setIndeterminate(checkedCount > 0 && checkedCount < totalCount);
  }, [value]);

  const handleAllCheck = (checked: boolean) => {
    if (checked) {
      onChange(TERMS_LIST.map(term => term.type));
    } else {
      onChange([]);
    }
  };

  const handleItemCheck = (type: string, checked: boolean) => {
    if (checked) {
      onChange([...value, type]);
    } else {
      onChange(value.filter(v => v !== type));
    }
  };

  const handleLinkClick = (e: React.MouseEvent, link?: string) => {
    if (!link) return;

    e.preventDefault();
    e.stopPropagation();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        약관 동의 <span className="text-red-500">*</span>
      </label>

      <div className="space-y-3 rounded-lg border border-gray-200 p-4">
        {/* 전체 동의 */}
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
          <Checkbox
            id="all-terms"
            checked={allChecked}
            onCheckedChange={handleAllCheck}
            disabled={disabled}
            className={cn(
              indeterminate && 'data-[state=checked]:bg-blue-600 data-[state=checked]:opacity-50'
            )}
          />
          <label
            htmlFor="all-terms"
            className={cn(
              'flex-1 cursor-pointer text-sm font-medium',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            전체 동의
          </label>
        </div>

        {/* 개별 약관 */}
        <div className="space-y-2">
          {TERMS_LIST.map((term) => (
            <div key={term.type} className="flex items-center space-x-3">
              <Checkbox
                id={`terms-${term.type}`}
                checked={value.includes(term.type)}
                onCheckedChange={(checked) => handleItemCheck(term.type, checked as boolean)}
                disabled={disabled}
              />
              <label
                htmlFor={`terms-${term.type}`}
                className={cn(
                  'flex flex-1 items-center justify-between text-sm',
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                )}
              >
                <span>
                  {term.required && (
                    <span className="text-red-500">(필수) </span>
                  )}
                  {!term.required && (
                    <span className="text-gray-500">(선택) </span>
                  )}
                  {term.label}
                </span>
                {term.link && (
                  <button
                    type="button"
                    onClick={(e) => handleLinkClick(e, term.link)}
                    className="ml-2 text-xs text-blue-600 underline hover:text-blue-700"
                    disabled={disabled}
                  >
                    보기
                  </button>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}