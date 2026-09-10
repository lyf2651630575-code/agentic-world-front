import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function JsonOut({ data }: { data: unknown }) {
  if (data == null) return <div className="empty">尚无输出</div>;
  return <pre className="out">{JSON.stringify(data, null, 2)}</pre>;
}

export function InspirePage() {
  const [raw, setRaw] = useState("");
  const [tags, setTags] = useState("culture,ai");
  const [title, setTitle] = useState("web-batch");
  const [theme, setTheme] = useState("");
  const [out, setOut] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      setOut(await fn());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    run(() => api("/api/inspire/add", { method: "POST", body: JSON.stringify({ raw, tags: tagList }) }));
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">WORKBENCH / INSPIRE</div>
          <h1>灵感录入</h1>
          <p>捕获原始灵感，seed 演示数据，导出 batch 供世界观层消费。</p>
        </div>
        <Link className="btn ghost" to="/workbench/world">
          下一步 · 世界观
        </Link>
      </div>
      {err && <div className="banner-err">{err}</div>}
      <div className="wb-grid">
        <div className="panel">
          <h2>录入</h2>
          <form onSubmit={onAdd}>
            <div className="field">
              <label>原始灵感</label>
              <textarea rows={4} value={raw} onChange={(e) => setRaw(e.target.value)} required />
            </div>
            <div className="field" style={{ marginTop: "0.75rem" }}>
              <label>标签（逗号分隔）</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="actions">
              <button className="btn" type="submit" disabled={busy}>
                添加
              </button>
              <button
                className="btn ghost"
                type="button"
                disabled={busy}
                onClick={() => run(() => api("/api/inspire/seed", { method: "POST" }))}
              >
                Seed 演示
              </button>
              <button
                className="btn ghost"
                type="button"
                disabled={busy}
                onClick={() => run(() => api("/api/inspire/list"))}
              >
                列表
              </button>
            </div>
          </form>
        </div>
        <div className="panel">
          <h2>导出 Batch</h2>
          <div className="field">
            <label>标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label>主题提示（可选）</label>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div className="actions">
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  api("/api/inspire/export", {
                    method: "POST",
                    body: JSON.stringify({ title, theme: theme || null }),
                  }),
                )
              }
            >
              导出
            </button>
          </div>
        </div>
        <div className="panel">
          <h2>输出</h2>
          <JsonOut data={out} />
        </div>
      </div>
    </div>
  );
}

export function WorldPage() {
  const [name, setName] = useState("");
  const [out, setOut] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      setOut(await fn());
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
          <div className="crumb">WORKBENCH / WORLD</div>
          <h1>世界观</h1>
          <p>从最新灵感 batch 演化世界观包；可列表与查看 latest。</p>
        </div>
        <div className="actions" style={{ margin: 0 }}>
          <Link className="btn ghost" to="/workbench/inspire">
            灵感
          </Link>
          <Link className="btn ghost" to="/workbench/transform">
            转化
          </Link>
        </div>
      </div>
      {err && <div className="banner-err">{err}</div>}
      <div className="panel">
        <div className="field">
          <label>世界观名称（可选）</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="留空则自动命名" />
        </div>
        <div className="actions">
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() =>
              run(() =>
                api("/api/world/build", {
                  method: "POST",
                  body: JSON.stringify({ name: name || null }),
                }),
              )
            }
          >
            构建
          </button>
          <button className="btn ghost" type="button" disabled={busy} onClick={() => run(() => api("/api/world/latest"))}>
            Latest
          </button>
          <button className="btn ghost" type="button" disabled={busy} onClick={() => run(() => api("/api/world/list"))}>
            列表
          </button>
        </div>
        <JsonOut data={out} />
      </div>
    </div>
  );
}

export function TransformPage() {
  const [out, setOut] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [comic, setComic] = useState(true);
  const [game, setGame] = useState(true);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      setOut(await fn());
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
          <div className="crumb">WORKBENCH / TRANSFORM</div>
          <h1>转化</h1>
          <p>世界观 → ReleaseBundle（小说 / 漫剧 / 游戏等复合产物）。</p>
        </div>
        <Link className="btn ghost" to="/workbench/quant">
          下一步 · 量化
        </Link>
      </div>
      {err && <div className="banner-err">{err}</div>}
      <div className="panel">
        <div className="actions">
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-dim)" }}>
            <input type="checkbox" checked={comic} onChange={(e) => setComic(e.target.checked)} /> 含漫剧
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-dim)" }}>
            <input type="checkbox" checked={game} onChange={(e) => setGame(e.target.checked)} /> 含游戏
          </label>
        </div>
        <div className="actions">
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() =>
              run(() =>
                api("/api/transform/run", {
                  method: "POST",
                  body: JSON.stringify({ include_comic: comic, include_game: game }),
                }),
              )
            }
          >
            运行流水线
          </button>
          <button
            className="btn ghost"
            type="button"
            disabled={busy}
            onClick={() => run(() => api("/api/transform/latest"))}
          >
            Latest Bundle
          </button>
        </div>
        <JsonOut data={out} />
      </div>
    </div>
  );
}

export function QuantPage() {
  const [out, setOut] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      setOut(await fn());
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
          <div className="crumb">WORKBENCH / QUANT</div>
          <h1>量化建议</h1>
          <p>从最新 ReleaseBundle 生成教育向信号报告——非投资建议。</p>
        </div>
      </div>
      <div className="disclaimer">
        【风险提示】本输出仅供教育与模拟，不构成投资建议，不承诺任何收益，不做实盘下单。文化与金融市场均存在重大不确定性，请独立判断并自行承担风险。
      </div>
      {err && <div className="banner-err">{err}</div>}
      <div className="panel">
        <div className="actions">
          <button
            className="btn warn"
            type="button"
            disabled={busy}
            onClick={() => run(() => api("/api/quant/advise", { method: "POST", body: JSON.stringify({}) }))}
          >
            生成建议
          </button>
          <button className="btn ghost" type="button" disabled={busy} onClick={() => run(() => api("/api/quant/latest"))}>
            Latest 报告
          </button>
        </div>
        <JsonOut data={out} />
      </div>
    </div>
  );
}
