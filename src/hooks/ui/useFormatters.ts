import { differenceInCalendarDays, format } from 'date-fns';

export const DateFormatString = {
  MMM_DD_YYYY: 'MMM dd, yyyy',
  MM_DD_YYYY: 'MM/dd/yyyy',
  MM_DD_YYYY_HH_MM_A: 'MM/dd/yyyy hh:mm a',
  MM_DD_YYYY_HH_MM: 'MM/dd/yyyy HH:mm',
  MM_DD_YYYY_HH_MM_SS: 'MM/dd/yyyy HH:mm:ss',
  MM_DD_YYYY_HH_MM_SS_A: 'MM/dd/yyyy hh:mm:ss a',
  YYYY_MM_DD: 'yyyy-MM-dd',
  EEE_MM_DD_YYYY: 'EEE MMM dd',
};

const useFormatters = () => {
  const formatCurrency = (value: number | undefined, currency = 'USD', language = 'en-US') => {
    const amount = value ?? 0;
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date, useRelative = false): string => {
    if (useRelative) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
    }
    return format(date, DateFormatString.EEE_MM_DD_YYYY);
  };

  const formatDaysUntil = (date: Date | undefined) => {
    if (!date) {
      return '';
    }

    const diffDays = differenceInCalendarDays(date, new Date());

    return `${diffDays}`;
  };

  const formatNumber = (value: number | undefined, decimals = 0, language = 'en-US') => {
    const numberValue = value ?? 0;
    return new Intl.NumberFormat(language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value ?? 0);
  };

  return {
    formatCurrency,
    formatDate,
    formatDaysUntil,
    formatNumber,
  };
};

export default useFormatters;
