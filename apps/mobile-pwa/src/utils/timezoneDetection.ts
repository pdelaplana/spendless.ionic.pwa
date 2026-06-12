/**
 * Detects the user's currency based on their browser timezone.
 * Supports: PHP, AUD, USD, EUR, GBP
 * Defaults to USD for all other regions.
 */
export function detectCurrencyFromTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Philippines: PHP
    if (timezone === 'Asia/Manila') {
      return 'PHP';
    }

    // Australia: AUD
    if (timezone.startsWith('Australia/')) {
      return 'AUD';
    }

    // United Kingdom: GBP
    if (timezone === 'Europe/London') {
      return 'GBP';
    }

    // European Union: EUR (excluding UK)
    // Common EU timezones
    const euTimezones = [
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'Europe/Rome',
      'Europe/Vienna',
      'Europe/Brussels',
      'Europe/Amsterdam',
      'Europe/Stockholm',
      'Europe/Copenhagen',
      'Europe/Helsinki',
      'Europe/Oslo',
      'Europe/Warsaw',
      'Europe/Prague',
      'Europe/Budapest',
      'Europe/Bucharest',
      'Europe/Athens',
      'Europe/Lisbon',
      'Europe/Dublin',
      'Europe/Zagreb',
      'Europe/Sofia',
      'Europe/Vilnius',
      'Europe/Riga',
      'Europe/Tallinn',
      'Europe/Ljubljana',
      'Europe/Bratislava',
      'Europe/Luxembourg',
      'Europe/Malta',
    ];

    if (euTimezones.includes(timezone)) {
      return 'EUR';
    }

    // Default: USD for all other regions (Americas, most of Asia, Africa, etc.)
    return 'USD';
  } catch (error) {
    console.error('Error detecting timezone:', error);
    // Fallback to USD on any error
    return 'USD';
  }
}
