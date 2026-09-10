import type { KnowledgeEntry, KnowledgeListResponse, KnowledgeMeta, KnowledgeSearchResponse, ApiStatus } from "./types";
import { api } from "./api";

export const knowledgeApi = {
  meta: () => api<KnowledgeMeta>("/api/knowledge/meta"),
  list: (params: { layer?: string; category?: string; tag?: string; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.layer) q.set("layer", params.layer);
    if (params.category) q.set("category", params.category);
    if (params.tag) q.set("tag", params.tag);
    q.set("limit", String(params.limit ?? 200));
    return api<KnowledgeListResponse>(`/api/knowledge/list?${q}`);
  },
  search: (params: { q: string; layer?: string; category?: string; tag?: string; limit?: number }) => {
    const q = new URLSearchParams();
    q.set("q", params.q);
    if (params.layer) q.set("layer", params.layer);
    if (params.category) q.set("category", params.category);
    if (params.tag) q.set("tag", params.tag);
    q.set("limit", String(params.limit ?? 50));
    return api<KnowledgeSearchResponse>(`/api/knowledge/search?${q}`);
  },
  get: (id: string) => api<KnowledgeEntry>(`/api/knowledge/get/${encodeURIComponent(id)}`),
  ingest: () => api<{ count: number }>("/api/knowledge/ingest", { method: "POST" }),
};

export const statusApi = () => api<ApiStatus>("/api/status");

export const LAYER_LABELS: Record<string, string> = {
  foundation: "Foundation · 基础",
  frontier: "Frontier · 前沿",
  compound: "Compound · 复合工作流",
};

export const CATEGORY_LABELS: Record<string, string> = {
  "llm-basics": "大模型基础",
  harness: "Harness 工程",
  models: "开闭源模型",
  venues: "顶会方向",
  novel: "小说工作流",
  "comic-drama": "漫剧工作流",
  game: "游戏工作流",
  "finance-llm": "金融工作流",
};

export function entryPoints(e: KnowledgeEntry): string[] {
  if (e.points && e.points.length) return e.points;
  return e.bullets || [];
}

export function entryMisconceptions(e: KnowledgeEntry): string[] {
  return e.misconceptions || [];
}
