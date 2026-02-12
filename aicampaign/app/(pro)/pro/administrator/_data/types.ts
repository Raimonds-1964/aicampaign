export type Manager = {
  id: string;
  name: string;
};

export type Account = {
  id: string;
  name: string;
  ownerId: string;
};

export type KeywordRow = {
  id: string;
  text: string;
  match?: "broad" | "phrase" | "exact";
};

export type Campaign = {
  id: string;
  name: string;
  accountId: string;
  keywords?: KeywordRow[];
  negativeKeywords?: KeywordRow[];
};
