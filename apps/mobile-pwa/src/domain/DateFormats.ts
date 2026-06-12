export class DateFormat {
  private constructor(
    public readonly code: string,
    public readonly label: string,
  ) {
    // Ensure immutability
    Object.freeze(this);
  }

  // Pre-defined date format instances
  static readonly DD_MM_YYYY_SLASH = new DateFormat('dd/MM/yyyy', 'dd/MM/yyyy');
  static readonly MM_DD_YYYY_SLASH = new DateFormat('MM/dd/yyyy', 'MM/dd/yyyy');
  static readonly YYYY_MM_DD_SLASH = new DateFormat('yyyy/MM/dd', 'yyyy/MM/dd');
  static readonly DD_MM_YYYY_DASH = new DateFormat('dd-MM-yyyy', 'dd-MM-yyyy');
  static readonly MM_DD_YYYY_DASH = new DateFormat('MM-dd-yyyy', 'MM-dd-yyyy');
  static readonly YYYY_MM_DD_DASH = new DateFormat('yyyy-MM-dd', 'yyyy-MM-dd');
  static readonly DD_MM_YYYY_DOT = new DateFormat('dd.MM.yyyy', 'dd.MM.yyyy');
  static readonly MM_DD_YYYY_DOT = new DateFormat('MM.dd.yyyy', 'MM.dd.yyyy');
  static readonly YYYY_MM_DD_DOT = new DateFormat('yyyy.MM.dd', 'yyyy.MM.dd');
  static readonly DD_MMMM_YYYY = new DateFormat('dd MMMM yyyy', 'dd MMMM yyyy');

  // Retrieval methods
  static getAllDateFormats(): readonly DateFormat[] {
    return [
      DateFormat.DD_MM_YYYY_SLASH,
      DateFormat.MM_DD_YYYY_SLASH,
      DateFormat.YYYY_MM_DD_SLASH,
      DateFormat.DD_MM_YYYY_DASH,
      DateFormat.MM_DD_YYYY_DASH,
      DateFormat.YYYY_MM_DD_DASH,
      DateFormat.DD_MM_YYYY_DOT,
      DateFormat.MM_DD_YYYY_DOT,
      DateFormat.YYYY_MM_DD_DOT,
      DateFormat.DD_MMMM_YYYY,
    ];
  }

  static fromCode(code: string): DateFormat | undefined {
    return DateFormat.getAllDateFormats().find((df) => df.code === code);
  }

  // Value equality
  equals(other: DateFormat): boolean {
    return this.code === other.code;
  }

  // Utility method for checking format type
  isSlashFormat(): boolean {
    return this.code.includes('/');
  }

  isDashFormat(): boolean {
    return this.code.includes('-');
  }

  isDotFormat(): boolean {
    return this.code.includes('.');
  }

  isFullTextMonth(): boolean {
    return this.code.includes('MMMM');
  }
}

// For backward compatibility
export const DATEFORMATS = DateFormat.getAllDateFormats();
