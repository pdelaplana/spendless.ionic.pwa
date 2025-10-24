import { describe, expect, it, vi } from 'vitest';
import { detectCurrencyFromTimezone } from './timezoneDetection';

describe('detectCurrencyFromTimezone', () => {
  it('should return PHP for Asia/Manila timezone', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'Asia/Manila',
    } as Intl.ResolvedDateTimeFormatOptions);

    expect(detectCurrencyFromTimezone()).toBe('PHP');
  });

  it('should return AUD for Australian timezones', () => {
    const australianTimezones = [
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Brisbane',
      'Australia/Perth',
      'Australia/Adelaide',
    ];

    for (const timezone of australianTimezones) {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: timezone,
      } as Intl.ResolvedDateTimeFormatOptions);

      expect(detectCurrencyFromTimezone()).toBe('AUD');
    }
  });

  it('should return GBP for Europe/London timezone', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'Europe/London',
    } as Intl.ResolvedDateTimeFormatOptions);

    expect(detectCurrencyFromTimezone()).toBe('GBP');
  });

  it('should return EUR for European Union timezones', () => {
    const euTimezones = [
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'Europe/Rome',
      'Europe/Amsterdam',
    ];

    for (const timezone of euTimezones) {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: timezone,
      } as Intl.ResolvedDateTimeFormatOptions);

      expect(detectCurrencyFromTimezone()).toBe('EUR');
    }
  });

  it('should return USD for American timezones', () => {
    const americanTimezones = [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
    ];

    for (const timezone of americanTimezones) {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: timezone,
      } as Intl.ResolvedDateTimeFormatOptions);

      expect(detectCurrencyFromTimezone()).toBe('USD');
    }
  });

  it('should return USD for Asian timezones (excluding Philippines)', () => {
    const asianTimezones = ['Asia/Tokyo', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Bangkok'];

    for (const timezone of asianTimezones) {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: timezone,
      } as Intl.ResolvedDateTimeFormatOptions);

      expect(detectCurrencyFromTimezone()).toBe('USD');
    }
  });

  it('should return USD for African timezones', () => {
    const africanTimezones = ['Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos'];

    for (const timezone of africanTimezones) {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: timezone,
      } as Intl.ResolvedDateTimeFormatOptions);

      expect(detectCurrencyFromTimezone()).toBe('USD');
    }
  });

  it('should return USD as fallback when timezone detection fails', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(() => {
      throw new Error('Timezone detection failed');
    });

    expect(detectCurrencyFromTimezone()).toBe('USD');
  });

  it('should return USD for unknown/unrecognized timezones', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'Unknown/Timezone',
    } as Intl.ResolvedDateTimeFormatOptions);

    expect(detectCurrencyFromTimezone()).toBe('USD');
  });
});
