# API Design / API 设计

本文件描述接口设计。当前已实现 Auth 接口和 `GET /health`，其他业务接口仍是后续设计。

## Auth

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录并返回 token |
| GET | `/auth/me` | 获取当前用户信息 |

### POST `/auth/register`

Request:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "role": "player",
  "avatar_url": null,
  "created_at": "2026-06-09T15:27:54.351048+08:00"
}
```

Duplicate email or username returns `400`.

### POST `/auth/login`

Request:

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

Invalid credentials return `401`.

### GET `/auth/me`

Requires:

```text
Authorization: Bearer <access_token>
```

Response matches the register user response. Missing or invalid tokens return `401`.

## Characters

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/characters` | 创建角色车卡 |
| GET | `/characters` | 获取当前用户角色列表 |
| GET | `/characters/{id}` | 获取角色详情 |
| PUT | `/characters/{id}` | 更新角色车卡 |
| DELETE | `/characters/{id}` | 删除或归档角色 |

## Dice

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/dice/roll` | 执行投骰 |
| GET | `/dice/history` | 获取投骰历史 |

## Modules

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/modules` | 创建模组 |
| GET | `/modules` | 获取模组列表 |
| GET | `/modules/{id}` | 获取模组详情 |
| PUT | `/modules/{id}` | 更新模组信息 |
| DELETE | `/modules/{id}` | 删除模组 |
| POST | `/modules/{id}/upload` | 上传模组 PDF 文件 |
| POST | `/modules/{id}/parse` | 解析模组文件 |
| GET | `/modules/{id}/chunks` | 获取模组文本块 |
| POST | `/modules/{id}/search` | 检索模组知识库 |

## Campaigns

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/campaigns` | 创建战役 |
| GET | `/campaigns` | 获取战役列表 |
| GET | `/campaigns/{id}` | 获取战役详情 |
| PUT | `/campaigns/{id}` | 更新战役 |
| POST | `/campaigns/{id}/act` | 玩家输入行动并触发 AI 主持人回复 |
| GET | `/campaigns/{id}/messages` | 获取战役聊天记录 |

## Rules

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/rules` | 创建规则条目 |
| GET | `/rules/search` | 搜索规则条目 |
| GET | `/rules/{id}` | 获取规则详情 |
| POST | `/rules/ask` | AI 规则问答 |

## Forum

| Method | Path | 说明 |
| --- | --- | --- |
| GET | `/forum/categories` | 获取论坛分类 |
| POST | `/forum/posts` | 创建帖子 |
| GET | `/forum/posts` | 获取帖子列表 |
| GET | `/forum/posts/{id}` | 获取帖子详情 |
| PUT | `/forum/posts/{id}` | 更新帖子 |
| DELETE | `/forum/posts/{id}` | 删除帖子 |
| POST | `/forum/posts/{id}/replies` | 创建回复 |
| GET | `/forum/posts/{id}/replies` | 获取帖子回复 |

## 通用约定

- 请求和响应默认使用 JSON。
- 鉴权接口使用 JWT bearer token。
- 文件上传接口后续使用 multipart/form-data。
- 错误响应后续统一为 `{ "detail": "..." }` 或结构化错误对象。
- 分页接口后续统一支持 `page`、`page_size`、`total`。
