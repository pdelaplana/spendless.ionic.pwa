export class Currency {
  private constructor(
    public readonly code: string,
    public readonly symbol: string,
  ) {
    // Ensure immutability
    Object.freeze(this);
  }

  // Pre-defined currency instances
  static readonly USD = new Currency('USD', '$');
  static readonly AUD = new Currency('AUD', 'A$');
  static readonly PHP = new Currency('PHP', '₱');

  // Retrieval methods
  static getAllCurrencies(): readonly Currency[] {
    return [Currency.USD, Currency.AUD, Currency.PHP];
  }

  static fromCode(code: string): Currency | undefined {
    return Currency.getAllCurrencies().find((c) => c.code === code);
  }

  // Domain behavior
  format(amount: number): string {
    return `${this.symbol}${amount.toFixed(2)}`;
  }

  // Value equality
  equals(other: Currency): boolean {
    return this.code === other.code;
  }
}

// For backward compatibility
export const CURRENCIES = Currency.getAllCurrencies();
