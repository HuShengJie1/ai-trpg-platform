# API Design / API 设计

本文件描述接口设计。当前已实现 Auth 接口、角色车卡接口和 `GET /health`，其他业务接口仍是后续设计。

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
| GET | `/characters/rules` | 获取支持的角色规则系统 |
| GET | `/characters/coc7/skill-catalog` | 获取 COC7 标准技能和专攻目录 |
| GET | `/characters/coc7/occupations` | 获取 COC7 职业列表，可按名称搜索 |
| GET | `/characters/coc7/occupations/{occupation_id}` | 获取 COC7 职业详情 |
| POST | `/characters/coc7` | 创建当前登录用户的 COC7 角色卡 |
| GET | `/characters/coc7/{id}/skills` | 获取当前用户的 COC7 角色技能 |
| PUT | `/characters/coc7/{id}/skills` | 批量替换当前用户的 COC7 角色技能 |
| POST | `/characters/dnd5e` | 创建当前登录用户的 DND5E 角色卡 |
| GET | `/characters` | 获取当前用户角色列表 |
| GET | `/characters/{id}` | 获取角色详情 |
| PUT | `/characters/coc7/{id}` | 更新当前登录用户的 COC7 角色卡 |
| PUT | `/characters/dnd5e/{id}` | 更新当前登录用户的 DND5E 角色卡 |
| DELETE | `/characters/{id}` | 删除角色 |

All character write, list, detail, update, and delete endpoints except `/characters/rules`, `/characters/coc7/skill-catalog`, and the COC7 occupation catalog endpoints require:

```text
Authorization: Bearer <access_token>
```

### GET `/characters/rules`

Response:

```json
[
  {
    "id": "coc7",
    "name": "COC7",
    "description": "Call of Cthulhu 7th Edition character sheet"
  },
  {
    "id": "dnd5e",
    "name": "DND5E",
    "description": "Dungeons & Dragons 5th Edition character sheet"
  }
]
```

### GET `/characters/coc7/skill-catalog`

Returns the normalized COC7 skill catalog. Fixed skills expose `base_value`; attribute-based skills expose `base_formula`; specialized skills include selectable `specializations`.

```json
[
  {
    "key": "fighting",
    "name": "格斗",
    "category": "combat",
    "base_value": null,
    "base_formula": "specialization",
    "allows_specialization": true,
    "allows_custom_specialization": true,
    "is_custom": false,
    "sort_order": 18,
    "note": null,
    "specializations": [
      {
        "key": "brawl",
        "name": "斗殴",
        "base_value": 25,
        "sort_order": 1
      }
    ]
  }
]
```

### GET `/characters/coc7/occupations`

Returns all COC7 occupations ordered by name. The optional `search` query parameter performs a partial name match, for example:

```text
GET /characters/coc7/occupations?search=侦探
```

Each list item uses the same response shape as the detail endpoint:

```json
{
  "id": 5,
  "name": "侦探",
  "description": "short occupation description",
  "skill_points_formula": "教育×2＋力量或敏捷×2",
  "skill_points_formula_json": {
    "type": "choice",
    "terms": [
      {"attribute": "edu", "multiplier": 2},
      {"choose_one": ["str", "dex"], "multiplier": 2}
    ]
  },
  "credit_min": 20,
  "credit_max": 70,
  "credit_note": null,
  "occupation_skills": ["侦查", "图书馆使用"],
  "created_at": "2026-07-11T00:00:00Z",
  "updated_at": "2026-07-11T00:00:00Z"
}
```

### GET `/characters/coc7/occupations/{occupation_id}`

Returns one occupation using the shape above. A missing occupation returns `404` with `COC7 occupation not found`.

### POST `/characters/coc7`

Creates one row in `characters` and one row in `coc7_character_sheets`.

Request includes the public `name` plus COC7-specific fields:

```json
{
  "name": "Dr. Armitage",
  "player_name": "Alice",
  "occupation_id": 5,
  "personal_interest_points": 160,
  "credit_rating": 40,
  "str": 50,
  "con": 55,
  "siz": 60,
  "dex": 45,
  "app": 40,
  "int": 80,
  "pow": 65,
  "edu": 75,
  "luck": 70,
  "hp": 11,
  "max_hp": 11,
  "mp": 13,
  "max_mp": 13,
  "san": 65,
  "starting_san": 65,
  "max_san": 99,
  "spending_level": "standard",
  "cash": "cash note",
  "assets": "asset note",
  "personal_description": "short original description",
  "ideology_beliefs": "short original belief",
  "significant_people": "short original person note",
  "meaningful_locations": "short original place note",
  "treasured_possessions": "short original possession note",
  "traits": "short original trait",
  "key_connection": "short original key connection",
  "skills_json": {},
  "occupation_skills_json": {},
  "equipment_json": {},
  "weapons_json": {}
}
```

COC7 attributes, luck, and credit rating are validated from 0 to 100. `max_san` is validated from 0 to 99. The backend stores user-filled values and does not roll dice or automatically generate attributes.

When `occupation_id` is present, the backend verifies that the occupation exists, copies its current name into the legacy `occupation` snapshot field, and calculates `occupation_skill_points` from the linked occupation formula and current attributes. Any client-provided occupation name or occupation skill-point total is overwritten for linked characters. Formula attributes must be positive; otherwise creation or update returns `422`.

The COC7 sheet response includes the relation and a reproducible calculation detail:

```json
{
  "occupation_id": 5,
  "occupation": "侦探",
  "occupation_skill_points": 260,
  "occupation_skill_points_detail": {
    "formula": "教育×2＋力量或敏捷×2",
    "selected_attribute": "dex",
    "calculation": "60×2＋70×2",
    "total": 260
  }
}
```

Supported formula types are `fixed`, `sum`, and `choice`. A choice selects the highest current attribute value; ties select the first attribute listed in `choose_one`. Updating a linked occupation or any referenced attribute recalculates the stored total. Existing character sheets with `occupation_id = null` remain readable and continue using their saved text snapshot and point total.

### PUT `/characters/coc7/{id}/skills`

Replaces the complete normalized skill list for one owned COC7 character. Fixed and formula-based base values are resolved by the backend. For example, `own_language` uses the character's EDU and `dodge` uses half DEX rounded down.

```json
{
  "skills": [
    {
      "skill_key": "spot_hidden",
      "occupation_points": 20,
      "interest_points": 5,
      "growth_points": 0,
      "is_occupation": true,
      "improvement_checked": false,
      "sort_order": 1
    },
    {
      "skill_key": "fighting",
      "specialization_key": "brawl",
      "growth_points": 5
    },
    {
      "skill_key": "custom",
      "custom_name": "地方传说",
      "base_value": 5,
      "interest_points": 25
    }
  ]
}
```

Each response item includes the resolved `base_value` and computed `value`.

### GET `/characters/coc7/{id}/skills`

Returns the same normalized role skill list without modifying it. Cross-user access returns `404`.

### POST `/characters/dnd5e`

Creates one row in `characters` and one row in `dnd5e_character_sheets`.

Request includes the public `name` plus DND5E-specific fields:

```json
{
  "name": "Mira",
  "race": "Human",
  "class_name": "Fighter",
  "level": 3,
  "strength": 16,
  "dexterity": 12,
  "constitution": 14,
  "intelligence": 10,
  "wisdom": 11,
  "charisma": 13
}
```

DND5E `level` is validated from 1 to 20. Ability scores are validated from 1 to 30.

### Character Responses

List items include `id`, `user_id`, `rule_system`, `name`, `summary`, `created_at`, and `updated_at`. `summary` is a lightweight object for list cards. COC7 summaries include `occupation`, `age`, `hp`, `mp`, and `san`; DND5E summaries include `race`, `class_name`, `level`, `current_hp`, and `armor_class`.

Detail responses include the same public character fields plus `sheet`, which contains the matching rule-specific sheet. Users can only access their own characters. Missing or cross-user characters return `404`. Updating through the wrong rule-specific endpoint returns `400`.

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
