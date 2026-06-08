# Database Design / 数据库设计

本文件只描述数据库表设计，不创建真实 SQLAlchemy 模型或 Alembic migration。

## 1. user

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 用户 ID | 主键 |
| username | 用户名 | 唯一显示名或登录名 |
| email | 邮箱 | 唯一登录邮箱 |
| hashed_password | 密码哈希 | MVP-1 实现，不保存明文 |
| display_name | 昵称 | 页面展示名称 |
| avatar_url | 头像地址 | 可为空 |
| is_active | 是否启用 | 账号状态 |
| created_at | 创建时间 | 记录注册时间 |
| updated_at | 更新时间 | 记录资料更新时间 |

## 2. character

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 角色 ID | 主键 |
| user_id | 所属用户 | 外键到 user |
| name | 角色名 | 角色展示名称 |
| system | 规则系统 | 例如 CoC、D&D 或自定义 |
| summary | 角色简介 | 简短描述 |
| sheet_data | 车卡数据 | JSON，保存属性、技能、物品等 |
| is_archived | 是否归档 | 隐藏旧角色 |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

## 3. dice_roll

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 投骰记录 ID | 主键 |
| user_id | 投骰用户 | 外键到 user |
| campaign_id | 所属战役 | 可为空 |
| character_id | 所属角色 | 可为空 |
| expression | 投骰表达式 | 例如 `1d20+5` |
| result | 最终结果 | 数值或文本结果 |
| detail | 投骰明细 | JSON，保存每颗骰子结果 |
| created_at | 创建时间 | 记录投骰时间 |

## 4. module

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 模组 ID | 主键 |
| owner_id | 创建者 | 外键到 user |
| title | 模组标题 | 模组名称 |
| description | 模组简介 | 简短介绍 |
| system | 规则系统 | 模组适用规则 |
| visibility | 可见性 | private/public 等 |
| status | 处理状态 | draft/ready/parsing 等 |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

## 5. module_file

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 文件 ID | 主键 |
| module_id | 所属模组 | 外键到 module |
| original_name | 原始文件名 | 用户上传时的名称 |
| storage_path | 存储路径 | 服务器本地或对象存储路径 |
| mime_type | 文件类型 | 例如 application/pdf |
| file_size | 文件大小 | 字节数 |
| parse_status | 解析状态 | pending/parsed/failed |
| created_at | 上传时间 | 记录上传时间 |

## 6. module_chunk

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 文本块 ID | 主键 |
| module_id | 所属模组 | 外键到 module |
| module_file_id | 来源文件 | 外键到 module_file |
| page_number | 页码 | 来源 PDF 页码 |
| chunk_index | 块序号 | 文件内切分顺序 |
| content | 文本内容 | 解析后的文本块 |
| embedding | 向量 | 后续 pgvector 字段 |
| metadata | 元数据 | JSON，保存标题、章节等 |
| created_at | 创建时间 | 记录写入时间 |

## 7. campaign

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 战役 ID | 主键 |
| owner_id | 创建者 | 外键到 user |
| module_id | 使用模组 | 外键到 module，可为空 |
| title | 战役标题 | 战役名称 |
| description | 战役简介 | 简短说明 |
| state | 战役状态 | JSON，保存场景、进度等 |
| status | 运行状态 | active/paused/finished |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

## 8. campaign_character

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 关系 ID | 主键 |
| campaign_id | 战役 ID | 外键到 campaign |
| character_id | 角色 ID | 外键到 character |
| user_id | 玩家 ID | 外键到 user |
| role | 战役身份 | player/gm/observer |
| joined_at | 加入时间 | 记录加入时间 |

## 9. campaign_message

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 消息 ID | 主键 |
| campaign_id | 所属战役 | 外键到 campaign |
| sender_user_id | 发送用户 | 玩家消息时使用，可为空 |
| character_id | 发送角色 | 角色发言时使用，可为空 |
| sender_type | 发送方类型 | user/character/ai/system |
| content | 消息内容 | 聊天文本 |
| message_type | 消息类型 | action/dialogue/roll/system |
| metadata | 元数据 | JSON，保存检索块、模型信息等 |
| created_at | 创建时间 | 记录消息时间 |

## 10. rule_entry

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 规则条目 ID | 主键 |
| system | 规则系统 | 适用规则 |
| title | 标题 | 规则条目标题 |
| content | 内容 | 用户自建或授权内容 |
| tags | 标签 | JSON 或数组 |
| source | 来源说明 | 用户输入、公开资料或授权来源 |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

## 11. forum_category

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 分类 ID | 主键 |
| name | 分类名 | 论坛板块名称 |
| description | 分类说明 | 板块简介 |
| sort_order | 排序 | 控制展示顺序 |
| created_at | 创建时间 | 记录创建时间 |

## 12. forum_post

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 帖子 ID | 主键 |
| category_id | 所属分类 | 外键到 forum_category |
| author_id | 作者 | 外键到 user |
| title | 标题 | 帖子标题 |
| content | 内容 | 帖子正文 |
| tags | 标签 | JSON 或数组 |
| is_pinned | 是否置顶 | 论坛展示控制 |
| is_locked | 是否锁定 | 禁止回复控制 |
| created_at | 创建时间 | 记录发帖时间 |
| updated_at | 更新时间 | 记录更新时间 |

## 13. forum_reply

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 回复 ID | 主键 |
| post_id | 所属帖子 | 外键到 forum_post |
| author_id | 作者 | 外键到 user |
| content | 回复内容 | 回复正文 |
| parent_reply_id | 父回复 | 用于楼中楼，可为空 |
| created_at | 创建时间 | 记录回复时间 |
| updated_at | 更新时间 | 记录更新时间 |
