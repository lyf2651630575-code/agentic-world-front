import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "./api";

type Tab = "knowledge" | "inspire" | "world" | "transform" | "quant";

const TABS: { id: Tab; label: string }[] = [
  { id: "knowledge", label: "知识检索" },
  { id: "inspire", label: "灵感录入" },
  { id: "world", label: "世界观" },
  { id: "transform", label: "转化" },
  { id: "quant", label: "量化建议" },
];

function pretty(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export default function App() {
  const [tab, setTab] = useState<Tab>("knowledge");
  const [status, setStatus] = useState<{ llm_mode?: string; knowledge_entries?: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const s = await api<{ llm_mode: string; knowledge_entries: number }>("/api/status");
      setStatus(s);
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return (
    <div className="app">
      <header className="top">
        <h1>Agentic World</h1>
        <div className="meta">
          {status
            ? `llm=${status.llm_mode} · knowledge=${status.knowledge_entries}`
            : "API 未连接（请先启动 :8000）"}
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => {
              setError("");
              setTab(t.id);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error ? <p className="err">{error}</p> : null}

      {tab === "knowledge" && (
        <KnowledgePanel
          busy={busy}
          setBusy={setBusy}
          setError={setError}
          onDone={refreshStatus}
        />
      )}
      {tab === "inspire" && (
        <InspirePanel busy={busy} setBusy={setBusy} setError={setError} />
      )}
      {tab === "world" && (
        <WorldPanel busy={busy} setBusy={setBusy} setError={setError} />
      )}
      {tab === "transform" && (
        <TransformPanel busy={busy} setBusy={setBusy} setError={setError} />
      )}
      {tab === "quant" && (
        <QuantPanel busy={busy} setBusy={setBusy} setError={setError} />
      )}
    </div>
  );
}

function KnowledgePanel({
  busy,
  setBusy,
  setError,
  onDone,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string) => void;
  onDone: () => void;
}) {
  const [q, setQ] = useState("小说工作流");
  const [items, setItems] = useState<
    { id: string; title: string; layer: string; summary: string; bullets: string[] }[]
  >([]);

  async function search(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ items: typeof items }>(
        `/api/knowledge/search?q=${encodeURIComponent(q)}&limit=15`,
      );
      setItems(res.items);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function ingest() {
    setBusy(true);
    setError("");
    try {
      await api("/api/knowledge/ingest", { method: "POST" });
      onDone();
      await search();
    } catch (err) {
      setError(String(err));
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>知识检索</h2>
      <p className="hint">检索本地知识库条目；无 API key 时引擎仍可用 rag_template。</p>
      <form className="row" onSubmit={search}>
        <label className="field">
          关键词
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="例如：RAG Agent" />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          检索
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={ingest}>
          重建索引
        </button>
      </form>
      <ul className="list">
        {items.map((it) => (
          <li key={it.id}>
            <strong>
              {it.title} <span className="sub">({it.id} · {it.layer})</span>
            </strong>
            <div className="sub">{it.summary}</div>
            {it.bullets?.slice(0, 3).map((b) => (
              <div className="sub" key={b}>
                · {b}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InspirePanel({
  busy,
  setBusy,
  setError,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string) => void;
}) {
  const [raw, setRaw] = useState("");
  const [tags, setTags] = useState("环境");
  const [out, setOut] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const item = await api("/api/inspire/add", {
        method: "POST",
        body: JSON.stringify({
          raw,
          tags: tags
            .split(/[,，\s]+/)
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      setOut(pretty(item));
      setRaw("");
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/inspire/seed", { method: "POST" });
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function list() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/inspire/list");
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function exportBatch() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/inspire/export", {
        method: "POST",
        body: JSON.stringify({ title: "web-batch", theme: "潮汐" }),
      });
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>灵感录入</h2>
      <p className="hint">写入本地 store，可导出 batch 供世界观层使用。</p>
      <form onSubmit={add}>
        <label className="field">
          灵感文本
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} required />
        </label>
        <div className="row" style={{ marginTop: "0.75rem" }}>
          <label className="field">
            标签（空格或逗号分隔）
            <input value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={busy || !raw.trim()}>
            添加
          </button>
        </div>
      </form>
      <div className="row">
        <button className="btn ghost" type="button" disabled={busy} onClick={seed}>
          填充演示灵感
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={list}>
          查看列表
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={exportBatch}>
          导出 batch
        </button>
      </div>
      {out ? <pre className="out">{out}</pre> : null}
    </section>
  );
}

function WorldPanel({
  busy,
  setBusy,
  setError,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string) => void;
}) {
  const [name, setName] = useState("潮汐时钟世界观");
  const [out, setOut] = useState("");

  async function build(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/world/build", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function loadLatest() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/world/latest");
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function list() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/world/list");
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>世界观构建</h2>
      <p className="hint">基于最新灵感 batch（需先导出）演化 WorldviewPackage。</p>
      <form className="row" onSubmit={build}>
        <label className="field">
          名称
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          构建
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={loadLatest}>
          加载最新
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={list}>
          列表
        </button>
      </form>
      {out ? <pre className="out">{out}</pre> : null}
    </section>
  );
}

function TransformPanel({
  busy,
  setBusy,
  setError,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string) => void;
}) {
  const [out, setOut] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/transform/run", {
        method: "POST",
        body: JSON.stringify({ include_comic: true, include_game: true }),
      });
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function latest() {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/transform/latest");
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>转化</h2>
      <p className="hint">世界观 → 小说大纲 / 漫剧 / 游戏 → ReleaseBundle。</p>
      <div className="row">
        <button className="btn" type="button" disabled={busy} onClick={run}>
          运行全链路
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={latest}>
          查看最新 Bundle
        </button>
      </div>
      {out ? <pre className="out">{out}</pre> : null}
    </section>
  );
}

function QuantPanel({
  busy,
  setBusy,
  setError,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string) => void;
}) {
  const [out, setOut] = useState("");
  const [disclaimer, setDisclaimer] = useState("");

  async function advise() {
    setBusy(true);
    setError("");
    try {
      const res = await api<{ disclaimer?: string; recommendation?: string; allocation?: Record<string, number>; risk_level?: string }>(
        "/api/quant/advise",
        { method: "POST", body: JSON.stringify({}) },
      );
      setDisclaimer(res.disclaimer || "");
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function latest() {
    setBusy(true);
    setError("");
    try {
      const res = await api<{ disclaimer?: string }>("/api/quant/latest");
      setDisclaimer(res.disclaimer || "");
      setOut(pretty(res));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>量化建议（教育模拟）</h2>
      <p className="hint">基于 ReleaseBundle 生成再投入配置；不做实盘。</p>
      <div className="disclaimer">
        【风险提示】本输出仅供教育与模拟，不构成投资建议，不承诺任何收益，不做实盘下单。
      </div>
      <div className="row" style={{ marginTop: "0.75rem" }}>
        <button className="btn" type="button" disabled={busy} onClick={advise}>
          生成建议
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={latest}>
          查看最新报告
        </button>
      </div>
      {disclaimer ? <div className="disclaimer">{disclaimer}</div> : null}
      {out ? <pre className="out">{out}</pre> : null}
    </section>
  );
}
