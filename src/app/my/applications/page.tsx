"use client";

import { useState } from "react";
import { ApplicationList } from "@/features/application/components/ApplicationList";
import type { MyApplicationsQuery } from "@/features/application/lib/dto";

export default function MyApplicationsPage() {
  const [filters, setFilters] = useState<MyApplicationsQuery>({
    page: 1,
    limit: 10,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">내 지원 목록</h1>

      <ApplicationList filters={filters} onFilterChange={setFilters} />
    </div>
  );
}
