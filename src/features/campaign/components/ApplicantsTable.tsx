'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelectApplicantsDialog } from './SelectApplicantsDialog';
import type { ApplicantResponse } from '@/features/campaign/lib/dto';

type Props = {
  applicants: ApplicantResponse[];
  campaignStatus: 'recruiting' | 'closed' | 'selected';
  campaignId: string;
  recruitmentCount: number;
};

export const ApplicantsTable = ({
  applicants,
  campaignStatus,
  campaignId,
  recruitmentCount,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCheckboxChange = (applicantId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, applicantId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== applicantId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = applicants
        .filter((app) => app.status === 'applied')
        .map((app) => app.id);
      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const isSelectable = campaignStatus === 'closed';
  const canSelect = isSelectable && selectedIds.length > 0;

  const getStatusBadge = (status: 'applied' | 'selected' | 'rejected') => {
    switch (status) {
      case 'selected':
        return <Badge variant="default">선정</Badge>;
      case 'rejected':
        return <Badge variant="destructive">반려</Badge>;
      case 'applied':
      default:
        return <Badge variant="secondary">지원완료</Badge>;
    }
  };

  if (applicants.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        아직 지원자가 없습니다
      </div>
    );
  }

  const selectableApplicants = applicants.filter((app) => app.status === 'applied');
  const allSelected = selectableApplicants.length > 0 && selectedIds.length === selectableApplicants.length;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            총 {applicants.length}명의 지원자
          </p>
          {isSelectable && (
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={!canSelect}
            >
              선정 완료
            </Button>
          )}
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isSelectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={selectableApplicants.length === 0}
                    />
                  </TableHead>
                )}
                <TableHead>이름</TableHead>
                <TableHead>채널 정보</TableHead>
                <TableHead>방문 예정일</TableHead>
                <TableHead>지원일</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => {
                const isChecked = selectedIds.includes(applicant.id);
                const isApplied = applicant.status === 'applied';

                return (
                  <TableRow
                    key={applicant.id}
                    className={
                      applicant.status === 'selected'
                        ? 'bg-green-50'
                        : applicant.status === 'rejected'
                          ? 'bg-red-50'
                          : ''
                    }
                  >
                    {isSelectable && (
                      <TableCell>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(applicant.id, checked as boolean)
                          }
                          disabled={!isApplied}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {applicant.influencerName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {applicant.channels.map((channel, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-semibold">
                              {channel.channelType}
                            </span>
                            : {channel.channelName} (
                            {channel.followerCount.toLocaleString()}명)
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(applicant.visitDate), 'yyyy-MM-dd', {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(applicant.createdAt), 'yyyy-MM-dd HH:mm', {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <SelectApplicantsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaignId={campaignId}
        selectedIds={selectedIds}
        recruitmentCount={recruitmentCount}
      />
    </>
  );
};
