"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { MyApplicationResponse } from "@/features/application/lib/dto";

type ApplicationCardProps = {
  application: MyApplicationResponse;
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { status, appliedAt, visitDate, message, campaign } = application;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>
              {campaign.companyName} · {campaign.location}
            </CardDescription>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground">지원일시:</span>
            <span>{format(new Date(appliedAt), "yyyy.MM.dd HH:mm")}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground">방문예정일:</span>
            <span>{format(new Date(visitDate), "yyyy.MM.dd")}</span>
          </div>
          <div>
            <span className="text-muted-foreground">각오 한마디:</span>
            <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {campaign.isDeleted ? (
          <Button disabled variant="ghost" className="w-full">
            삭제된 체험단
          </Button>
        ) : (
          <Link href={`/campaigns/${campaign.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              체험단 보기
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
