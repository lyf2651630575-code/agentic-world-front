import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EntryList } from "../components/EntryList";
import { SearchBox } from "../components/SearchBox";
import {
  CATEGORY_LABELS,
  LAYER_LABELS,
  knowledgeApi,
} from "../knowledge";
import type { KnowledgeEntry, KnowledgeMeta } from "../types";

const LAYER_ORDER = ["foundation", "frontier", "compound"];
const CAT_BY_LAYER: Record<string, string[]> = {
  foundation: ["llm-basics"],
  frontier: ["venues", "models", "harness"],
  compound: ["novel", "comic-drama", "game", "finance-llm"],
};

export function WikiPage() {
  const [params, setParams] = useSearchParams();
  const layer = params.get("layer") || "";
  const category = params.get("category") || "";
  const tag = params.get("tag") || "";
  const q = params.get("q") || "";

  const [meta, setMeta] = useState<KnowledgeMeta | null>(null);
  const [items, setItems] = useState<KnowledgeEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadMeta = useCallback(() => {
    knowledgeApi.meta().then(setMeta).catch((e: Error) => setErr(e.message));
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    setErr(null);
    try {
      if (q) {
        const res = await knowledgeApi.search({
          q,
          layer: layer || undefined,
          category: category || undefined,
          tag: tag || undefined,
          limit: 100,
        });
        setItems(res.items);
      } else {
        const res = await knowledgeApi.list({
          layer: layer || undefined,
          category: category || undefined,
          tag: tag || undefined,
          limit: 200,
        });
        setItems(res.items);
      }
    } catch (e) {
      setItems([]);
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [q, layer, category, tag]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    setParams(next);
  }

  const title = useMemo(() => {
    if (q) return `搜索「${q}」`;
    if (category) return CATEGORY_LABELS[category] || category;
    if (layer) return LAYER_LABELS[layer] || layer;
    return "全部知识";
  }, [q, category, layer]);

  async function reingest() {
    setBusy(true);
    setErr(null);
    try {
      await knowledgeApi.ingest();
      loadMeta();
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">KNOWLEDGE / WIKI</div>
          <h1>知识 Wiki</h1>
          <p>
            分层浏览 foundation · frontier · compound；关键词检索打真实 API；条目含要点、误区与来源。
          </p>
        </div>
        <button className="btn ghost" type="button" onClick={reingest} disabled={busy}>
          重建索引
        </button>
      </div>

      {err && <div className="banner-err">{err}</div>}
      {meta && (
        <div className="banner-info">
          索引 {meta.total} 条 · foundation {meta.layers.foundation ?? 0} · frontier{" "}
          {meta.layers.frontier ?? 0} · compound {meta.layers.compound ?? 0}
        </div>
      )}

      <div className="wiki-layout">
        <aside>
          <div className="side-nav">
            <h3>分层</h3>
            <button
              type="button"
              className={!layer && !category ? "active" : ""}
              onClick={() => setFilter({ layer: null, category: null })}
            >
              全部 <span className="cnt">{meta?.total ?? "—"}</span>
            </button>
            {LAYER_ORDER.map((l) => (
              <div className="group" key={l}>
                <button
                  type="button"
                  className={layer === l && !category ? "active" : ""}
                  onClick={() => setFilter({ layer: l, category: null })}
                >
                  {LAYER_LABELS[l] || l}
                  <span className="cnt">{meta?.layers?.[l] ?? 0}</span>
                </button>
                {(CAT_BY_LAYER[l] || []).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={category === c ? "active" : ""}
                    onClick={() => setFilter({ layer: l, category: c })}
                    style={{ paddingLeft: "1rem" }}
                  >
                    {CATEGORY_LABELS[c] || c}
                    <span className="cnt">{meta?.categories?.[c] ?? 0}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          {meta && (
            <div className="side-nav" style={{ marginTop: "0.75rem" }}>
              <h3>热门标签</h3>
              <div className="tag-cloud">
                {Object.entries(meta.tags)
                  .slice(0, 18)
                  .map(([t, n]) => (
                    <button
                      key={t}
                      type="button"
                      className={tag === t ? "active" : ""}
                      onClick={() => setFilter({ tag: tag === t ? null : t })}
                    >
                      {t} · {n}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </aside>

        <div>
          <SearchBox
            initial={q}
            busy={busy}
            onSearch={(next) => setFilter({ q: next || null })}
          />
          <div className="page-head" style={{ border: "none", paddingBottom: 0, marginBottom: "0.75rem" }}>
            <div>
              <h1 style={{ fontSize: "1.25rem" }}>{title}</h1>
              <p>
                {busy ? "加载中…" : `${items.length} 条`}
                {tag ? ` · tag:${tag}` : ""}
              </p>
            </div>
            {(q || tag) && (
              <Link className="btn ghost" to="/wiki">
                清除检索
              </Link>
            )}
          </div>
          {busy && !items.length ? <div className="loading">拉取知识</div> : <EntryList items={items} />}
        </div>
      </div>
    </div>
  );
}
