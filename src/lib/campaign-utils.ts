import { parseISO, isAfter, isBefore } from 'date-fns';

export const isRecruitmentClosed = (
  recruitmentEnd: string,
  status: string
): boolean => {
  if (status === 'closed' || status === 'selected') {
    return true;
  }

  const endDate = parseISO(recruitmentEnd);
  const now = new Date();

  return isAfter(now, endDate);
};

export const canApply = (
  recruitmentStart: string,
  recruitmentEnd: string,
  status: string,
  hasApplied: boolean
): boolean => {
  if (hasApplied) {
    return false;
  }

  if (isRecruitmentClosed(recruitmentEnd, status)) {
    return false;
  }

  const startDate = parseISO(recruitmentStart);
  const now = new Date();
  if (isBefore(now, startDate)) {
    return false;
  }

  return true;
};
