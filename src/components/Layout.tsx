import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiBase } from "../api";
import { statusApi } from "../knowledge";
import type { ApiStatus } from "../types";

const LINKS = [
  { to: "/wiki", label: "知识 Wiki" },
  { to: "/harness", label: "Harness" },
  { to: "/models", label: "大模型" },
  { to: "/workbench/inspire", label: "灵感" },
  { to: "/workbench/world", label: "世界观" },
  { to: "/workbench/transform", label: "转化" },
  { to: "/workbench/quant", label: "量化" },
];

export function Layout() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    statusApi()
      .then((s) => {
        if (alive) {
          setStatus(s);
          setErr(null);
        }
      })
      .catch((e: Error) => {
        if (alive) {
          setStatus(null);
          setErr(e.message);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark">Agentic World</span>
          <span className="brand-sub">AW · SYS</span>
        </NavLink>
        <nav className="nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={`status-pill ${err ? "err" : ""}`} title={err || apiBase()}>
          <span className="dot" />
          {err
            ? "API 离线"
            : status
              ? `${status.knowledge_entries} entries · ${status.llm_mode}`
              : "检测中"}
        </div>
      </header>
      <main className="main">
        {err && (
          <div className="banner-err">
            后端不可用：{err}
            <br />
            知识数据来自 Agentic World API（默认 http://127.0.0.1:8000），无假数据回退。
          </div>
        )}
        <Outlet context={{ status, apiError: err }} />
      </main>
      <footer className="footer">
        Agentic World · 知识源 packages/knowledge · API {apiBase()}
      </footer>
    </div>
  );
}
