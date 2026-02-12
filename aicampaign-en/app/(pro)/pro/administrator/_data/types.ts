export type Manager = {
  /** Unique manager identifier (e.g. "mgr-1") */
  id: string;
  /** Full name displayed in the UI */
  name: string;
};

export type Account = {
  /** Google Ads account ID (internal) */
  id: string;
  /** Account display name */
  name: string;
  /** Owner manager ID or ADMIN_OWNER_ID */
  ownerId: string;
};

export type KeywordRow = {
  /** Keyword row identifier */
  id: string;
  /** Keyword text */
  text: string;
  /** Google Ads keyword match type */
  match?: "broad" | "phrase" | "exact";
};

export type Campaign = {
  /** Campaign ID */
  id: string;
  /** Campaign name as shown in Google Ads */
  name: string;
  /** Parent account ID */
  accountId: string;
  /** Targeting keywords */
  keywords?: KeywordRow[];
  /** Negative keywords */
  negativeKeywords?: KeywordRow[];
};
