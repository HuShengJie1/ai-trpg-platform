# Database Design / 数据库设计

本文件描述数据库表设计。当前已实现 `users` 表，以及多规则角色卡相关的 `characters`、`coc7_character_sheets`、`dnd5e_character_sheets` 表。

## 1. users

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 用户 ID | 主键 |
| username | 用户名 | 唯一显示名或登录名 |
| email | 邮箱 | 唯一登录邮箱 |
| password_hash | 密码哈希 | 不保存明文密码 |
| role | 用户角色 | 默认 `player` |
| avatar_url | 头像地址 | 可为空 |
| created_at | 创建时间 | 记录注册时间 |
| updated_at | 更新时间 | 记录资料更新时间 |

## 2. characters

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 公共角色 ID | 主键 |
| user_id | 所属用户 | 外键到 `users.id` |
| rule_system | 规则系统 | 第一版支持 `coc7` 和 `dnd5e` |
| name | 角色名 | 所有规则通用的展示名称 |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

`characters` 只保存所有规则共用的字段。不同规则系统的完整角色卡字段不放在同一个 `sheet_json` 字段中，而是通过 `rule_system` 查询对应的规则专属表。

## 2.1. coc7_character_sheets

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | COC7 角色卡 ID | 主键 |
| character_id | 公共角色 ID | 外键到 `characters.id`，唯一 |
| occupation | 职业 | 可为空 |
| age | 年龄 | 可为空 |
| gender | 性别 | 可为空 |
| residence | 居住地 | 可为空 |
| birthplace | 出生地 | 可为空 |
| background | 背景摘要 | 可为空，不存放版权规则书文本 |
| str/con/siz/dex/app/int/pow/edu/luck | COC7 属性 | 基础校验范围为 0 到 100 |
| hp/mp/san/build/damage_bonus/move | 衍生属性 | 当前只做存储，不自动计算 |
| skills_json | 技能数据 | JSON |
| equipment_json | 装备数据 | JSON |
| backstory_json | 背景故事数据 | JSON |
| status_json | 状态数据 | JSON |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

## 2.2. dnd5e_character_sheets

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | DND5E 角色卡 ID | 主键 |
| character_id | 公共角色 ID | 外键到 `characters.id`，唯一 |
| race | 种族 | 可为空 |
| class_name | 职业名 | 避免使用 Python 保留字 `class` |
| subclass | 子职业 | 可为空 |
| level | 等级 | 基础校验范围为 1 到 20 |
| background | 背景摘要 | 可为空，不存放版权规则书文本 |
| alignment | 阵营 | 可为空 |
| player_name | 玩家名 | 可为空 |
| experience_points | 经验值 | 非负整数 |
| strength/dexterity/constitution/intelligence/wisdom/charisma | 六维属性 | 基础校验范围为 1 到 30 |
| armor_class/initiative/speed/max_hp/current_hp/temporary_hp/hit_dice | 战斗字段 | 当前只做存储，不自动计算 |
| proficiencies_json | 熟练项数据 | JSON |
| skills_json | 技能数据 | JSON |
| equipment_json | 装备数据 | JSON |
| spellcasting_json | 法术数据 | JSON |
| features_json | 特性数据 | JSON |
| status_json | 状态数据 | JSON |
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
| character_id | 角色 ID | 外键到 characters |
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
