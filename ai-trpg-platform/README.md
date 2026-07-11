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
│   ├── pyproject.toml
│   ├── uv.lock
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

项目已完成基础框架初始化，并新增 Auth 模块、多规则角色卡前端和多规则角色卡后端：

- 创建前后端目录结构
- 创建 FastAPI 基础入口和路由占位
- 创建 Next.js 基础首页
- 创建 PostgreSQL docker-compose
- 创建环境变量示例、忽略规则和设计文档
- 创建后端用户注册、登录、JWT 鉴权和当前用户接口
- 创建后端多规则角色卡模块，支持 COC7 与 DND5E
- 创建前端注册、登录、我的账号页面
- 创建前端 Auth API 封装和 `localStorage` token 保存
- 创建前端角色卡列表、规则选择、COC7 表单、DND5E 表单、详情和编辑页面
- 创建前端 Character API 封装，复用已有 Auth token

当前不包含投骰、模组、PDF、AI、规则查询或论坛功能。

## 后续开发路线

1. MVP-1: 用户注册登录、JWT、角色卡、投骰、模组和战役核心后端
2. MVP-2: PDF 上传、PyMuPDF 文本提取、module_chunk 存储和 embedding 预留
3. MVP-3: AI service、RAG 检索、campaign act 流程和聊天记录保存
4. MVP-4: 规则查询、AI 规则问答、论坛分类、帖子和回帖
5. MVP-5: 前端页面整合与完整跑团体验

## 本地数据库

当前早期 MVP 开发优先使用本机已经安装好的 PostgreSQL，不要求安装 Docker。请先在本地 PostgreSQL 中创建开发数据库，并按 `.env.example` 配置 `.env`：

```text
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ai_trpg_platform
```

Docker 仍保留为可选方案，主要用于后续统一开发环境、部署、pgvector 验证或多人协作。

## 后端启动

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/health
```

Auth endpoints:

```text
POST http://127.0.0.1:8000/auth/register
POST http://127.0.0.1:8000/auth/login
GET  http://127.0.0.1:8000/auth/me
```

Character endpoints:

```text
GET    http://127.0.0.1:8000/characters/rules
GET    http://127.0.0.1:8000/characters/coc7/skill-catalog
POST   http://127.0.0.1:8000/characters/coc7
GET    http://127.0.0.1:8000/characters/coc7/{id}/skills
PUT    http://127.0.0.1:8000/characters/coc7/{id}/skills
POST   http://127.0.0.1:8000/characters/dnd5e
GET    http://127.0.0.1:8000/characters
GET    http://127.0.0.1:8000/characters/{id}
PUT    http://127.0.0.1:8000/characters/coc7/{id}
PUT    http://127.0.0.1:8000/characters/dnd5e/{id}
DELETE http://127.0.0.1:8000/characters/{id}
```

Character backend validation flow:

1. Register a user.
2. Log in and copy the bearer token.
3. Call `GET /characters/rules`.
4. Use `POST /characters/coc7` to create a COC7 character.
5. Use `POST /characters/dnd5e` to create a DND5E character.
6. Use `GET /characters` and `GET /characters/{id}` to verify list and detail responses.
7. Use the matching rule-specific `PUT` endpoint to update a character.
8. Use `DELETE /characters/{id}` to delete a character.

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

前端 Auth 页面:

```text
http://localhost:3000/register
http://localhost:3000/login
http://localhost:3000/me
```

前端角色卡页面:

```text
http://localhost:3000/characters
http://localhost:3000/characters/new
http://localhost:3000/characters/new/coc7
http://localhost:3000/characters/new/dnd5e
```

多规则角色卡前端验证流程:

```text
1. 登录。
2. 进入 /characters。
3. 点击创建角色。
4. 选择 COC7 并创建角色。
5. 查看并编辑 COC7 角色。
6. 返回创建角色，选择 DND5E 并创建角色。
7. 查看并编辑 DND5E 角色。
8. 删除角色。
```

前端默认调用后端:

```text
http://127.0.0.1:8000
```

如需覆盖后端地址，在 `frontend/.env.local` 中配置:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

不要提交真实的 `frontend/.env.local`。

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
