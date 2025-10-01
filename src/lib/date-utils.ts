import { differenceInDays, parseISO } from 'date-fns';

export const calculateDaysRemaining = (endDate: string): number => {
  const end = parseISO(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return differenceInDays(end, today);
};

export const isDeadlineSoon = (
  endDate: string,
  threshold: number = 3
): boolean => {
  const daysRemaining = calculateDaysRemaining(endDate);
  return daysRemaining >= 0 && daysRemaining <= threshold;
};
