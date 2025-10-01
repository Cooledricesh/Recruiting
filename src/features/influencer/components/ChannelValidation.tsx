"use client";

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { VerificationStatus } from '../lib/dto';

interface ChannelValidationProps {
  status: VerificationStatus;
}

export function ChannelValidation({ status }: ChannelValidationProps) {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          인증완료
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          <XCircle className="mr-1 h-3 w-3" />
          인증실패
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          <Clock className="mr-1 h-3 w-3" />
          검증대기
        </Badge>
      );
  }
}