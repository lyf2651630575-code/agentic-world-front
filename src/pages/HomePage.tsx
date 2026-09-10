import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { knowledgeApi, statusApi } from "../knowledge";
import type { KnowledgeMeta } from "../types";

const PORTALS = [
  {
    to: "/wiki",
    k: "01",
    t: "知识 Wiki",
    d: "Foundation / Frontier / Compound · 可逛可搜可读",
  },
  {
    to: "/harness",
    k: "02",
    t: "Harness 工程",
    d: "评测脚手架、工具调用、沙箱与可观测性",
  },
  {
    to: "/models",
    k: "03",
    t: "大模型卡",
    d: "开闭源定位、成本档与选型矩阵",
  },
  {
    to: "/workbench/inspire",
    k: "04",
    t: "工作台",
    d: "灵感 → 世界观 → 转化 → 量化流水线",
  },
];

export function HomePage() {
  const [meta, setMeta] = useState<KnowledgeMeta | null>(null);
  const [mode, setMode] = useState<string>("—");

  useEffect(() => {
    knowledgeApi.meta().then(setMeta).catch(() => setMeta(null));
    statusApi()
      .then((s) => setMode(s.llm_mode))
      .catch(() => setMode("offline"));
  }, []);

  return (
    <section className="hero">
      <div className="hero-brand">Agentic World</div>
      <p className="hero-lead">
        文化复利引擎的知识站与工作台——大模型基础、顶会方向、Harness 工程、开闭源模型卡，以及小说 / 漫剧 / 游戏 /
        金融工作流，全部来自主仓 knowledge API，真实可检索。
      </p>
      <div className="hero-cta">
        <Link className="btn" to="/wiki">
          进入 Wiki
        </Link>
        <Link className="btn ghost" to="/wiki?q=agent">
          搜 Agent
        </Link>
        <Link className="btn ghost" to="/models">
          模型卡
        </Link>
      </div>
      <div className="hero-meta">
        <span>ENTRIES {meta?.total ?? "—"}</span>
        <span>FOUNDATION {meta?.layers?.foundation ?? "—"}</span>
        <span>FRONTIER {meta?.layers?.frontier ?? "—"}</span>
        <span>COMPOUND {meta?.layers?.compound ?? "—"}</span>
        <span>LLM {mode}</span>
      </div>
      <div className="entry-grid">
        {PORTALS.map((p) => (
          <Link key={p.to} className="entry-link" to={p.to}>
            <span className="k">{p.k}</span>
            <span className="t">{p.t}</span>
            <span className="d">{p.d}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
