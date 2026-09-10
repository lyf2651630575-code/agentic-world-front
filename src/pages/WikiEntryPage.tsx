import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CATEGORY_LABELS,
  LAYER_LABELS,
  entryMisconceptions,
  entryPoints,
  knowledgeApi,
} from "../knowledge";
import type { KnowledgeEntry } from "../types";

export function WikiEntryPage() {
  const { id = "" } = useParams();
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    setErr(null);
    knowledgeApi
      .get(id)
      .then((e) => {
        if (alive) setEntry(e);
      })
      .catch((e: Error) => {
        if (alive) {
          setEntry(null);
          setErr(e.message);
        }
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (busy) return <div className="loading">加载条目</div>;
  if (err) {
    return (
      <div>
        <div className="banner-err">{err}</div>
        <Link className="btn ghost" to="/wiki">
          返回 Wiki
        </Link>
      </div>
    );
  }
  if (!entry) return null;

  const points = entryPoints(entry);
  const misconceptions = entryMisconceptions(entry);

  return (
    <article className="article">
      <div className="crumb">
        <Link to="/wiki">WIKI</Link>
        {" / "}
        <Link to={`/wiki?layer=${entry.layer}`}>{entry.layer}</Link>
        {" / "}
        <Link to={`/wiki?category=${entry.category}`}>{entry.category}</Link>
        {" / "}
        {entry.id}
      </div>
      <h1>{entry.title}</h1>
      <p className="lede">{entry.summary}</p>
      <div className="meta-row">
        <span className="chip layer">{LAYER_LABELS[entry.layer] || entry.layer}</span>
        <span className="chip cat">{CATEGORY_LABELS[entry.category] || entry.category}</span>
        <span className="chip">更新 {entry.updated || "—"}</span>
        {entry.path && <span className="chip">{entry.path}</span>}
        {entry.tags.map((t) => (
          <Link key={t} className="chip" to={`/wiki?tag=${encodeURIComponent(t)}`}>
            {t}
          </Link>
        ))}
      </div>

      <section className="section">
        <h2>要点</h2>
        {points.length ? (
          <ul>
            {points.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : (
          <p className="sum">暂无要点字段。</p>
        )}
      </section>

      {misconceptions.length > 0 && (
        <section className="section mis">
          <h2>常见误区</h2>
          <ul>
            {misconceptions.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section sources">
        <h2>来源</h2>
        {entry.sources.length ? (
          entry.sources.map((s, i) => (
            <div key={`${s.url}-${i}`}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title || s.url}
                </a>
              ) : (
                <span>{s.title}</span>
              )}
              {s.date && <span className="chip" style={{ marginLeft: "0.5rem" }}>{s.date}</span>}
            </div>
          ))
        ) : (
          <p className="sum">无来源链接。</p>
        )}
      </section>

      <div className="actions" style={{ marginTop: "1.5rem" }}>
        <Link className="btn ghost" to="/wiki">
          返回列表
        </Link>
        <Link className="btn ghost" to={`/wiki?category=${entry.category}`}>
          同分类
        </Link>
      </div>
    </article>
  );
}
