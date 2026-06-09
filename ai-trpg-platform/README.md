# AI TRPG Platform / AI 跑团平台

AI TRPG Platform 是一个面向跑团场景的 AI 辅助平台。项目后续将支持用户系统、角色车卡、投骰、模组管理、PDF 模组导入与解析、AI 带团、战役存档、规则查询和玩家论坛。

## 技术栈

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, SQLAlchemy, Pydantic, Alembic
- Database: PostgreSQL, reserved pgvector support for module knowledge retrieval
- PDF parsing: reserved PyMuPDF service layer
- AI: reserved service layer for OpenAI API or other LLM providers

## 项目结构

```text
ai-trpg-platform/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── package.json
│   └── README.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── README.md
├── docs/
├── uploads/modules/
├── .github/ISSUE_TEMPLATE/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 当前范围

本次只完成项目框架初始化：

- 创建前后端目录结构
- 创建 FastAPI 基础入口和路由占位
- 创建 Next.js 基础首页
- 创建 PostgreSQL docker-compose
- 创建环境变量示例、忽略规则和设计文档

当前不包含完整业务代码、真实用户认证、数据库模型、AI API 调用、PDF 解析逻辑或版权规则书内容。

## 后续开发路线

1. MVP-1: 用户注册登录、JWT、角色卡、投骰、模组和战役核心后端
2. MVP-2: PDF 上传、PyMuPDF 文本提取、module_chunk 存储和 embedding 预留
3. MVP-3: AI service、RAG 检索、campaign act 流程和聊天记录保存
4. MVP-4: 规则查询、AI 规则问答、论坛分类、帖子和回帖
5. MVP-5: 前端页面整合与完整跑团体验

## 本地数据库

当前早期 MVP 开发优先使用本机已经安装好的 PostgreSQL，不要求安装 Docker。请先在本地 PostgreSQL 中创建开发数据库，并按 `.env.example` 配置 `.env`：

```text
DATABASE_URL=postgresql+psycopg://postgres:Daodao0708@localhost:5432/ai_trpg_platform
```

Docker 仍保留为可选方案，主要用于后续统一开发环境、部署、pgvector 验证或多人协作。

## 后端启动

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/health
```

## 前端启动

```bash
cd frontend
npm install
npm run dev
```

默认访问:

```text
http://localhost:3000
```

## Docker 可选方案

当前开发不需要 Docker。如果你已经在本机安装 PostgreSQL，可以直接使用本地数据库。

保留 `docker-compose.yml` 是为了后续统一环境、部署、pgvector 或多人协作。需要时可以再启动：

```bash
docker compose up -d
```

Docker PostgreSQL 默认连接:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/ai_trpg
```

## 文档

- System design: `docs/SYSTEM_DESIGN.md`
- Database design: `docs/DATABASE_DESIGN.md`
- API design: `docs/API_DESIGN.md`
- ToDo list: `docs/TODO.md`
- Codex task map: `docs/CODEX_TASKS.md`
