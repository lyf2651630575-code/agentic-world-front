import { Link } from "react-router-dom";
import type { KnowledgeEntry } from "../types";
import { CATEGORY_LABELS, LAYER_LABELS } from "../knowledge";

export function EntryRow({ entry }: { entry: KnowledgeEntry }) {
  return (
    <Link className="entry-row" to={`/wiki/${encodeURIComponent(entry.id)}`}>
      <div>
        <h3>{entry.title}</h3>
        <p className="sum">{entry.summary}</p>
        <div className="meta-row">
          <span className="chip layer">{LAYER_LABELS[entry.layer] || entry.layer}</span>
          <span className="chip cat">{CATEGORY_LABELS[entry.category] || entry.category}</span>
          {entry.tags.slice(0, 4).map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <span className="updated">{entry.updated || "—"}</span>
    </Link>
  );
}

export function EntryList({ items }: { items: KnowledgeEntry[] }) {
  if (!items.length) {
    return <div className="empty">暂无条目。请检查筛选条件，或在后端执行知识 ingest。</div>;
  }
  return (
    <div className="entry-list">
      {items.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  );
}
