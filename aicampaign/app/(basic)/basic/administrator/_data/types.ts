export type Manager = {
  id: string;
  name: string;
};

export type Account = {
  id: string;
  name: string;
  ownerId: string;
};

/**
 * Atslēgvārda rinda tabulām un kampaņām
 */
export type KeywordRow = {
  id?: string;

  // Teksts, ko tabula rāda kā r.keyword
  keyword: string;

  // Saglabājam arī veco lauku, ja kaut kur vēl tiek lietots
  text?: string;

  match?: "broad" | "phrase" | "exact";

  // Papildu lauki, ko izmanto UI
  page?: number;    // lapa
  top?: number;     // TOP %
  clicks?: number;  // klikšķi
  cost?: number;    // izmaksas
  note?: string;    // piezīme
};

export type Campaign = {
  id: string;
  name: string;
  accountId: string;
  keywords?: KeywordRow[];
  negativeKeywords?: KeywordRow[];
};
