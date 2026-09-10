export type KnowledgeEntry = {
  id: string;
  title: string;
  layer: string;
  category: string;
  tags: string[];
  summary: string;
  bullets: string[];
  points?: string[];
  misconceptions?: string[];
  sources: { title: string; url: string; date?: string }[];
  updated: string;
  path?: string | null;
};

export type KnowledgeListResponse = {
  count: number;
  items: KnowledgeEntry[];
};

export type KnowledgeSearchResponse = KnowledgeListResponse & {
  query: string;
};

export type KnowledgeMeta = {
  total: number;
  layers: Record<string, number>;
  categories: Record<string, number>;
  tags: Record<string, number>;
};

export type ApiStatus = {
  root: string;
  llm_mode: string;
  knowledge_entries: number;
};
