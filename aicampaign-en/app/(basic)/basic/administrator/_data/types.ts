export type Manager = {
  id: string;
  name: string;
};

export type Account = {
  id: string;
  name: string;
  ownerId: string; // managerId or "admin"
};

/**
 * Keyword row used in keyword tables and campaign views
 */
export type KeywordRow = {
  id?: string;

  /** Keyword text displayed in tables */
  keyword: string;

  /** Legacy field (kept for backward compatibility) */
  text?: string;

  matchType?: "broad" | "phrase" | "exact";

  // Optional performance metrics used by UI
  page?: number;
  top?: number;        // Top of page rate (%)
  clicks?: number;
  cost?: number;
  note?: string;
};

export type Campaign = {
  id: string;
  name: string;
  accountId: string;
  keywords?: KeywordRow[];
  negativeKeywords?: KeywordRow[];
};
