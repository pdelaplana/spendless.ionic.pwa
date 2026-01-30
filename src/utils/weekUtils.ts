/**
 * Utility functions for week-based calculations
 */

/**
 * Get the start date of the week for a given date (Monday as start of week)
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get the end date of the week for a given date (Sunday as end of week)
 */
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

/**
 * Get the start and end dates of the current week
 */
export const getCurrentWeek = (): { start: Date; end: Date } => {
  const now = new Date();
  return {
    start: getWeekStart(now),
    end: getWeekEnd(now),
  };
};

/**
 * Get the start and end dates of the previous week
 */
export const getPreviousWeek = (): { start: Date; end: Date } => {
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  return {
    start: getWeekStart(lastWeek),
    end: getWeekEnd(lastWeek),
  };
};

/**
 * Check if a date falls within a specific week
 */
export const isDateInWeek = (date: Date, weekStart: Date, weekEnd: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(weekEnd);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

/**
 * Format week range as a string (e.g., "Jan 15 - Jan 21")
 */
export const formatWeekRange = (start: Date, end: Date): string => {
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endMonth = end.toLocaleString('default', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};
