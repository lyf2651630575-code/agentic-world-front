# Agentic World Front

独立前端仓库：调用 [agentic-world](https://github.com/lyf2651630575-code/agentic-world) 的 FastAPI（`apps/api`），**不包含**五层 Python 核心。

仓库：https://github.com/lyf2651630575-code/agentic-world-front

## 先起后端，再起前端

### 1. 后端 API（agentic-world 主仓）

```bash
git clone git@github.com:lyf2651630575-code/agentic-world.git
cd agentic-world
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt && pip install -e .
copy .env.example .env   # 可选填 OPENAI_API_KEY

uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000
```

健康检查：http://127.0.0.1:8000/health

无 API key 时后端为 `rag_template` 降级，仍可出可用草稿。

### 2. 本前端

```bash
git clone git@github.com:lyf2651630575-code/agentic-world-front.git
cd agentic-world-front
copy .env.example .env   # 确认 VITE_API_BASE_URL=http://127.0.0.1:8000
npm install
npm run dev
```

浏览器打开：**http://localhost:5173**

功能页：知识检索、灵感录入、世界观构建、转化、量化建议（含风险声明）。

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 主仓 API 根地址，如 `http://127.0.0.1:8000`（勿尾斜杠） |

未设置时：开发服可将 `/api`、`/health` 代理到 `127.0.0.1:8000`（见 `vite.config.ts`）。跨仓部署务必设置 `VITE_API_BASE_URL`，并确保主仓 CORS 允许前端源（默认含 localhost:5173 / 4173）。

**不要提交 `.env`。**

## 生产构建预览

```bash
# 先保证 API 在跑
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"   # PowerShell
npm run build
npm run preview
# 预览默认 http://localhost:4173
```

静态产物在 `dist/`，可托管到任意静态服务；由网关或浏览器直连主仓 API。

## Docker（可选）

```bash
docker build -t agentic-world-front .
docker run --rm -p 5173:5173 -e VITE_API_BASE_URL=http://host.docker.internal:8000 agentic-world-front
```

后端请在主仓单独起进程或用主仓 `docker compose`（仅 API）。

## 与主仓关系

| 仓库 | 职责 |
|------|------|
| [agentic-world](https://github.com/lyf2651630575-code/agentic-world) | CLI + 五层包 + FastAPI |
| **本仓** | Vite + React UI |
