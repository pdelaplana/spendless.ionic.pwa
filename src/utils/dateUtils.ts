/**
 * Date utility functions for consistent timezone handling throughout the application.
 *
 * Strategy:
 * - Calendar dates (spend dates, period dates) are handled in user's timezone
 * - Timestamps (createdAt, updatedAt) remain as precise UTC moments
 * - Display is automatically handled by date-fns in user's locale
 */

/**
 * Converts a date input string (YYYY-MM-DD) to a Date object at local midnight.
 * Use this when parsing dates from HTML date inputs or similar form fields.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing local midnight on that date
 *
 * @example
 * const spendDate = dateUtils.fromDateInput("2024-01-15");
 * // Creates Date for Jan 15, 2024 at 00:00 in user's timezone
 */
export const fromDateInput = (dateString: string): Date => {
  return new Date(`${dateString}T00:00:00`);
};

/**
 * Converts a Date object to a date input string (YYYY-MM-DD) in user's timezone.
 * Use this when setting default values for HTML date inputs.
 *
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format (user's timezone)
 *
 * @example
 * const inputValue = dateUtils.toDateInput(new Date());
 * // Returns "2024-01-15" for today's date in user's timezone
 */
export const toDateInput = (date: Date): string => {
  return date.toLocaleDateString('sv-SE'); // Swedish locale gives YYYY-MM-DD format
};

/**
 * Gets the current date and time.
 * Use this for default values when you need the current moment.
 *
 * @returns Current Date object
 *
 * @example
 * const defaultDate = dateUtils.getCurrentDate();
 * // Current moment, suitable for createdAt/updatedAt fields
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Gets the start of today in user's timezone.
 * Use this for date comparisons where you need "today" boundaries.
 *
 * @returns Date object representing start of today (00:00) in user's timezone
 *
 * @example
 * const today = dateUtils.getToday();
 * const isTodaySpend = spend.date >= today && spend.date < dateUtils.getTomorrow();
 */
export const getToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Gets the start of tomorrow in user's timezone.
 * Use this for date range comparisons (today < x < tomorrow).
 *
 * @returns Date object representing start of tomorrow (00:00) in user's timezone
 */
export const getTomorrow = (): Date => {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

/**
 * Checks if a date falls on today in user's timezone.
 * More reliable than string comparison for timezone handling.
 *
 * @param date - Date to check
 * @returns True if the date is today in user's timezone
 *
 * @example
 * const isSpendToday = dateUtils.isToday(spend.date);
 */
export const isToday = (date: Date): boolean => {
  return date.toDateString() === new Date().toDateString();
};

/**
 * Checks if a date falls on yesterday in user's timezone.
 *
 * @param date - Date to check
 * @returns True if the date is yesterday in user's timezone
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Gets a date string for "today" in YYYY-MM-DD format.
 * Convenience function for form default values.
 *
 * @returns Today's date as YYYY-MM-DD string
 *
 * @example
 * const defaultFormDate = dateUtils.getTodayString();
 * // "2024-01-15"
 */
export const getTodayString = (): string => {
  return toDateInput(new Date());
};

/**
 * Collection of all date utility functions.
 * Import this for a consistent API.
 */
export const dateUtils = {
  fromDateInput,
  toDateInput,
  getCurrentDate,
  getToday,
  getTomorrow,
  isToday,
  isYesterday,
  getTodayString,
};

export default dateUtils;
