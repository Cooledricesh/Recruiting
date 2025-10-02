"use client";

import { Calendar, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CampaignDetailInfoProps = {
  recruitmentStart: string;
  recruitmentEnd: string;
  recruitmentCount: number;
  benefits: string;
  mission: string;
  daysRemaining?: number;
};

export function CampaignDetailInfo({
  recruitmentStart,
  recruitmentEnd,
  recruitmentCount,
  benefits,
  mission,
  daysRemaining,
}: CampaignDetailInfoProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy.MM.dd", { locale: ko });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>모집 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400">
              모집 기간: {formatDate(recruitmentStart)} ~{" "}
              {formatDate(recruitmentEnd)}
            </span>
            {daysRemaining !== undefined && daysRemaining >= 0 && (
              <Badge className="ml-auto bg-blue-500 text-white">
                D-{daysRemaining}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400">
              모집 인원: {recruitmentCount}명
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>제공 혜택</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {benefits}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>미션</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {mission}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}
