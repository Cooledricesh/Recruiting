"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApplicationStatus } from "@/features/application/lib/dto";

type ApplicationFilterProps = {
  currentStatus?: ApplicationStatus;
  onChange: (status?: ApplicationStatus) => void;
};

export function ApplicationFilter({
  currentStatus,
  onChange,
}: ApplicationFilterProps) {
  const handleChange = (value: string) => {
    if (value === "all") {
      onChange(undefined);
    } else {
      onChange(value as ApplicationStatus);
    }
  };

  return (
    <Tabs value={currentStatus ?? "all"} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="all">전체</TabsTrigger>
        <TabsTrigger value="applied">신청완료</TabsTrigger>
        <TabsTrigger value="selected">선정</TabsTrigger>
        <TabsTrigger value="rejected">반려</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
