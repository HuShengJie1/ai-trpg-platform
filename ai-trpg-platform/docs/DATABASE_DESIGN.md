# Database Design / 数据库设计

本文件描述数据库表设计。当前已实现用户、多规则角色卡、COC7 技能目录和 COC7 职业目录相关表。

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
| occupation_id | 关联职业 ID | 可为空，外键到 `coc7_occupations.id`，删除职业时设为 `NULL` |
| player_name | 玩家名 | 可为空 |
| portrait_url | 肖像地址 | 可为空 |
| occupation | 职业 | 可为空 |
| occupation_details | 职业补充说明 | 可为空 |
| age | 年龄 | 可为空 |
| gender | 性别 | 可为空 |
| residence | 居住地 | 可为空 |
| birthplace | 出生地 | 可为空 |
| background | 背景摘要 | 可为空，不存放版权规则书文本 |
| occupation_skill_points | 本职技能点 | 关联职业时由后端根据职业公式和当前属性强制计算 |
| personal_interest_points | 个人兴趣技能点 | 用户手动填写或前端计算后保存 |
| credit_rating | 信用评级 | 基础校验范围为 0 到 100 |
| str/con/siz/dex/app/int/pow/edu/luck | COC7 属性 | 基础校验范围为 0 到 100 |
| hp/max_hp/mp/max_mp/san/starting_san/max_san | HP、MP、SAN | 前端按 `(CON + SIZ) / 10` 向下取整计算 `max_hp`，按 `INT / 5` 向下取整计算 `mp`，并令 `san` 等于 `POW` |
| build/damage_bonus/move | 体格、伤害加值、移动力 | 前端按 `STR + SIZ` 对照表计算体格与伤害加值，并根据 `STR/DEX/SIZ` 与年龄计算移动力 |
| spending_level/cash/assets | 消费水平、现金、资产 | 根据角色信用评级相关信息手动填写 |
| personal_description | 形象描述 | 可为空 |
| ideology_beliefs | 思想和信念 | 可为空 |
| significant_people | 重要之人 | 可为空 |
| meaningful_locations | 意义非凡之地 | 可为空 |
| treasured_possessions | 宝贵之物 | 可为空 |
| traits | 特质 | 可为空 |
| key_connection | 关键背景连接 | 可为空 |
| injuries_scars | 伤口和伤疤 | 可为空 |
| phobias_manias | 恐惧症和躁狂症 | 可为空 |
| arcane_tomes_spells_artifacts | 神秘典籍、法术和物件 | 可为空 |
| encounters_with_strange_entities | 神话或怪异遭遇记录 | 可为空 |
| notes | 备注 | 可为空 |
| major_wound/unconscious/dying | 伤势状态 | 布尔值 |
| temporary_insanity/indefinite_insanity | 疯狂状态 | 布尔值 |
| skills_json | 旧版技能数据 | JSON 兼容字段；新技能数据使用规范化技能表 |
| occupation_skills_json | 本职技能标记或分配数据 | JSON |
| equipment_json | 装备数据 | JSON |
| weapons_json | 武器数据 | JSON |
| backstory_json | 背景故事数据 | JSON |
| status_json | 状态数据 | JSON |
| fellow_investigators_json | 同行调查员记录 | JSON |
| development_json | 成长、技能勾选等扩展记录 | JSON |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

COC7 第一版后端不实现投骰、属性生成、衍生值自动计算或规则文本复刻。职业技能点是例外：当 `occupation_id` 不为空时，后端根据职业公式强制计算并保存；无职业关联的旧角色仍保留原有手动点数。

## 2.2. coc7_skill_definitions

COC7 标准技能目录。每个技能只定义一次，角色卡不再重复保存技能名称、分类和固定基础值。

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 技能定义 ID | 主键 |
| key | 稳定技能标识 | 唯一，例如 `spot_hidden` |
| name | 中文技能名 | 例如侦查 |
| category | 技能分类 | investigation、combat、knowledge 等 |
| base_value | 固定基础值 | 属性公式或专攻技能可为空 |
| base_formula | 基础值公式类型 | `edu`、`dex_half` 或 `specialization` |
| allows_specialization | 是否允许专攻 | 外语、格斗、射击、科学等 |
| allows_custom_specialization | 是否允许自定义专攻 | 布尔值 |
| is_custom | 是否为自定义技能入口 | 布尔值 |
| sort_order | 显示顺序 | 按技能表顺序 |
| note | 简短实现备注 | 可为空 |
| created_at/updated_at | 时间字段 | 记录维护时间 |

## 2.3. coc7_skill_specializations

COC7 技能专攻目录，例如格斗（斗殴）、射击（手枪）、科学（数学）。

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 专攻 ID | 主键 |
| skill_definition_id | 所属技能 | 外键到 `coc7_skill_definitions.id` |
| key | 稳定专攻标识 | 技能内唯一 |
| name | 中文专攻名 | 展示名称 |
| base_value | 专攻基础值 | 范围 0 到 100 |
| sort_order | 显示顺序 | 按技能表顺序 |
| created_at | 创建时间 | 记录写入时间 |

## 2.4. coc7_character_skills

角色实际拥有的技能值。通过点数分项计算当前技能值：

```text
value = base_value + occupation_points + interest_points + growth_points
```

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 角色技能 ID | 主键 |
| character_sheet_id | COC7 角色卡 | 外键到 `coc7_character_sheets.id`，级联删除 |
| skill_definition_id | 标准技能 | 外键到技能目录 |
| skill_specialization_id | 标准专攻 | 可为空 |
| custom_name | 自定义技能名 | 自定义技能时使用 |
| custom_specialization | 自定义专攻名 | 自定义专攻时使用 |
| base_value | 创建时确定的基础值 | 固定值、属性公式值或专攻值 |
| occupation_points | 本职技能投入点 | 非负整数 |
| interest_points | 兴趣技能投入点 | 非负整数 |
| growth_points | 成长增加点 | 非负整数 |
| is_occupation | 是否为本职技能 | 布尔值 |
| improvement_checked | 是否勾选成长 | 布尔值 |
| sort_order | 角色卡显示顺序 | 非负整数 |
| created_at/updated_at | 时间字段 | 记录维护时间 |

技能目录由 `Coc7人物技能表.xlsx` 去重整理。表格中的重复格斗、射击、科学、生存、技艺等行被建模为同一技能的多个可选专攻，而不是重复技能定义。

## 2.5. dnd5e_character_sheets

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

## 2.6. coc7_occupations

COC7 调查员职业目录。MVP 使用单表保存职业展示信息、结构化信用范围、技能点公式和本职技能原文列表。

| 字段名 | 字段含义 | 简单说明 |
| --- | --- | --- |
| id | 职业 ID | 主键 |
| name | 职业名称 | 唯一，例如会计师 |
| description | 职业介绍 | 职业说明文本 |
| skill_points_formula | 技能点公式原文 | 例如 `教育×4` |
| skill_points_formula_json | 结构化技能点公式 | JSON，用于后端自动计算 |
| credit_min | 最低信用评级 | 0 到 99 |
| credit_max | 最高信用评级 | 0 到 99，且不小于最低值 |
| credit_note | 信用范围备注 | 原始范围后的补充说明，可为空 |
| occupation_skills_json | 本职技能 | JSON 字符串数组，保留固定、任选和组合规则原文 |
| created_at | 创建时间 | 记录创建时间 |
| updated_at | 更新时间 | 记录更新时间 |

职业数据通过本地 JSON 导入服务写入，不在迁移文件中嵌入职业介绍等可能受版权保护的内容。当前版本不将本职技能字符串强制关联到技能目录；后续需要自动校验任选技能时，再增加规范化关系表。

`coc7_character_sheets.occupation_id` 是可空外键并带索引。`occupation` 文本字段继续保存职业名称快照，兼容迁移前角色和职业名称后续变更。关联职业的技能点公式支持：

```text
fixed: 单一属性乘固定倍率
sum: 多个属性项相加
choice: 候选属性取当前最大值，同值时取公式中最先出现的属性
```

公式引用的属性必须已有正数值；缺失或为零时拒绝创建或更新，避免无意保存为零点。每次修改关联职业或角色属性时都会重新计算 `occupation_skill_points`。

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
