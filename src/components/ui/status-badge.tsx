"use client";

import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "applied" | "selected" | "rejected";
  size?: "sm" | "md" | "lg";
};

const statusConfig = {
  applied: {
    label: "신청완료",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  selected: {
    label: "선정",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "반려",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        sizeClass
      )}
    >
      {config.label}
    </span>
  );
}
