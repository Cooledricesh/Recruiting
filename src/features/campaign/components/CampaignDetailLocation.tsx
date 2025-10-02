"use client";

import { MapPin, Phone, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CampaignDetailLocationProps = {
  storeInfo: string;
  location: string;
  storePhone: string;
};

export function CampaignDetailLocation({
  storeInfo,
  location,
  storePhone,
}: CampaignDetailLocationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>매장 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-slate-500" />
          <div className="flex-1">
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {storeInfo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300">{location}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300">
            {storePhone}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
