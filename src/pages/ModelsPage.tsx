import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { entryPoints, knowledgeApi } from "../knowledge";
import type { KnowledgeEntry } from "../types";

export function ModelsPage() {
  const [items, setItems] = useState<KnowledgeEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(q = "") {
    setBusy(true);
    setErr(null);
    try {
      if (q) {
        const res = await knowledgeApi.search({ q, category: "models", limit: 50 });
        setItems(res.items);
      } else {
        const res = await knowledgeApi.list({ category: "models", limit: 100 });
        setItems(res.items);
      }
    } catch (e) {
      setItems([]);
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">FRONTIER / MODELS</div>
          <h1>大模型卡</h1>
          <p>
            开闭源定位、成本档与选型要点。对比感信息架构：先扫卡面摘要，再进详情读要点与来源。
          </p>
        </div>
        <Link className="btn ghost" to="/wiki?category=models">
          Wiki 视图
        </Link>
      </div>

      {err && <div className="banner-err">{err}</div>}
      <SearchBox busy={busy} placeholder="GPT / Claude / Qwen / open-weight…" onSearch={(q) => load(q)} />

      {busy && !items.length ? (
        <div className="loading">拉取模型卡</div>
      ) : (
        <div className="model-grid">
          {items.map((e) => {
            const pts = entryPoints(e).slice(0, 3);
            return (
              <Link key={e.id} className="model-card" to={`/wiki/${encodeURIComponent(e.id)}`}>
                <div className="meta-row">
                  {e.tags.slice(0, 3).map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <h3>{e.title}</h3>
                <p className="sum">{e.summary}</p>
                {pts.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--text-dim)", fontSize: "0.82rem" }}>
                    {pts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
                <span className="updated">{e.updated}</span>
              </Link>
            );
          })}
        </div>
      )}
      {!busy && !items.length && !err && <div className="empty">无模型条目。</div>}
    </div>
  );
}
