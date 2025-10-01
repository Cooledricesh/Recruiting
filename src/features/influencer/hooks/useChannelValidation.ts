"use client";

import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'es-toolkit';
import type { SNSPlatformType } from '@/constants/sns-platforms';
import {
  validateChannelUrl,
  extractChannelName,
  normalizeUrl,
} from '@/lib/validation/sns-channel';

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  normalizedUrl?: string;
  extractedName?: string;
}

export function useChannelValidation() {
  const [validationResults, setValidationResults] = useState<
    Record<string, ValidationResult>
  >({});

  // 실시간 URL 검증 (디바운싱 적용)
  const validateUrl = useMemo(
    () =>
      debounce((platform: SNSPlatformType, url: string, fieldId: string) => {
        if (!url) {
          setValidationResults(prev => ({
            ...prev,
            [fieldId]: { isValid: false },
          }));
          return;
        }

        const isValid = validateChannelUrl(platform, url);
        const normalizedUrl = normalizeUrl(url);
        const extractedName = extractChannelName(platform, url);

        setValidationResults(prev => ({
          ...prev,
          [fieldId]: {
            isValid,
            errorMessage: isValid
              ? undefined
              : `유효한 ${platform} URL 형식이 아닙니다`,
            normalizedUrl: isValid ? normalizedUrl : undefined,
            extractedName: extractedName || undefined,
          },
        }));
      }, 300),
    []
  );

  // 검증 결과 초기화
  const clearValidation = useCallback((fieldId: string) => {
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[fieldId];
      return newResults;
    });
  }, []);

  // 모든 검증 결과 초기화
  const clearAllValidations = useCallback(() => {
    setValidationResults({});
  }, []);

  return {
    validationResults,
    validateUrl,
    clearValidation,
    clearAllValidations,
  };
}