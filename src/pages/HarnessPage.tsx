import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EntryList } from "../components/EntryList";
import { SearchBox } from "../components/SearchBox";
import { knowledgeApi } from "../knowledge";
import type { KnowledgeEntry } from "../types";

export function HarnessPage() {
  const [items, setItems] = useState<KnowledgeEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load(query = "") {
    setBusy(true);
    setErr(null);
    try {
      if (query) {
        const res = await knowledgeApi.search({ q: query, category: "harness", limit: 50 });
        setItems(res.items);
      } else {
        const res = await knowledgeApi.list({ category: "harness", limit: 100 });
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
          <div className="crumb">FRONTIER / HARNESS</div>
          <h1>Harness 工程</h1>
          <p>
            Agent 系统的工程骨架：评测脚手架、工具协议、沙箱、记忆、可观测性与人机回路。以下条目全部来自 API
            category=harness。
          </p>
        </div>
        <Link className="btn ghost" to="/wiki?category=harness">
          Wiki 视图
        </Link>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h2>导读</h2>
        <p className="guide">
          Harness 不是「再包一层 Prompt」，而是把模型放进可复现的运行时：工具边界、状态机、评测门禁与观测信号。
          优先读 SWE-bench scaffolding、eval harness、MCP/tools、sandbox 与 observability，再按业务拼装 multi-agent
          编排。
        </p>
      </div>

      {err && <div className="banner-err">{err}</div>}
      <SearchBox
        initial={q}
        busy={busy}
        placeholder="在 harness 内检索…"
        onSearch={(next) => {
          setQ(next);
          load(next);
        }}
      />
      {busy && !items.length ? <div className="loading">拉取 harness</div> : <EntryList items={items} />}
    </div>
  );
}
