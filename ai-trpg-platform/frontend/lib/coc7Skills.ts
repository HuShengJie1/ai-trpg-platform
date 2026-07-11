import type { JsonRecord } from "../types/character";

export const coc7SkillCategories = [
  "调查与感知",
  "社交与语言",
  "战斗与行动",
  "医疗与体能",
  "知识与学术",
  "技艺与生存",
  "驾驶与操作",
  "自定义",
] as const;

export type Coc7SkillCategory = (typeof coc7SkillCategories)[number];
export type Coc7SkillKind = "fixed" | "specialized" | "custom";
export type Coc7SkillBaseRule = "fixed" | "edu" | "half_dex";

export type Coc7SkillOption = {
  label: string;
  base: number;
};

export type Coc7SkillDraft = {
  key: string;
  label: string;
  name: string;
  category: Coc7SkillCategory;
  kind: Coc7SkillKind;
  baseRule: Coc7SkillBaseRule;
  base: number;
  occupation: number;
  interest: number;
  growth: number;
  checked: boolean;
  specialization: string;
  options: Coc7SkillOption[];
};

type SkillTemplate = Omit<
  Coc7SkillDraft,
  "name" | "occupation" | "interest" | "growth" | "checked"
> & {
  defaultSpecialization?: string;
};

const languages = [
  "汉语",
  "英语",
  "日语",
  "法语",
  "俄语",
  "德语",
  "韩语",
  "粤语",
  "拉丁语",
  "荷兰语",
  "挪威语",
  "丹麦语",
  "印度语",
  "西班牙语",
  "葡萄牙语",
  "阿拉伯语",
].map((label) => ({ label, base: 1 }));

const fightingOptions: Coc7SkillOption[] = [
  { label: "斗殴", base: 25 },
  { label: "刀剑", base: 20 },
  { label: "矛", base: 20 },
  { label: "斧", base: 15 },
  { label: "绞索", base: 15 },
  { label: "链锯", base: 10 },
  { label: "链枷", base: 10 },
  { label: "鞭", base: 5 },
];

const firearmsOptions: Coc7SkillOption[] = [
  { label: "手枪", base: 20 },
  { label: "步枪/霰弹枪", base: 25 },
  { label: "冲锋枪", base: 15 },
  { label: "弓弩", base: 15 },
  { label: "机枪", base: 10 },
  { label: "重武器", base: 10 },
];

const scienceOptions: Coc7SkillOption[] = [
  { label: "数学", base: 10 },
  { label: "物理", base: 1 },
  { label: "化学", base: 1 },
  { label: "药学", base: 1 },
  { label: "地质学", base: 1 },
  { label: "生物学", base: 1 },
  { label: "动物学", base: 1 },
  { label: "植物学", base: 1 },
  { label: "天文学", base: 1 },
  { label: "密码学", base: 1 },
  { label: "气象学", base: 1 },
  { label: "工程学", base: 1 },
  { label: "鉴证", base: 1 },
  { label: "制药", base: 1 },
];

const survivalOptions = ["沙漠", "森林", "荒岛", "高山", "海上"].map(
  (label) => ({ label, base: 5 }),
);

const artOptions = [
  "表演",
  "音乐",
  "绘画",
  "艺术",
  "摄影",
  "写作",
  "书法",
  "打字",
  "速记",
  "伪造",
  "烹饪",
  "裁缝",
  "理发",
  "技术制图",
  "耕作",
  "木工",
  "铁匠",
  "焊接",
  "管道工",
].map((label) => ({ label, base: 5 }));

const pilotOptions = ["船", "马车", "飞行器"].map((label) => ({
  label,
  base: 1,
}));

function fixed(
  key: string,
  label: string,
  base: number,
  category: Coc7SkillCategory,
  baseRule: Coc7SkillBaseRule = "fixed",
): SkillTemplate {
  return {
    key,
    label,
    category,
    kind: "fixed",
    baseRule,
    base,
    specialization: "",
    options: [],
  };
}

function specialized(
  key: string,
  label: string,
  category: Coc7SkillCategory,
  options: Coc7SkillOption[],
  defaultSpecialization = "",
): SkillTemplate {
  const selected = options.find(
    (option) => option.label === defaultSpecialization,
  );

  return {
    key,
    label,
    category,
    kind: "specialized",
    baseRule: "fixed",
    base: selected?.base ?? options[0]?.base ?? 0,
    specialization: defaultSpecialization,
    defaultSpecialization,
    options,
  };
}

function custom(key: string, label: string): SkillTemplate {
  return {
    key,
    label,
    category: "自定义",
    kind: "custom",
    baseRule: "fixed",
    base: 0,
    specialization: "",
    options: [],
  };
}

const skillTemplates: SkillTemplate[] = [
  fixed("credit_rating", "信用评级", 0, "调查与感知"),
  fixed("cthulhu_mythos", "克苏鲁神话", 0, "调查与感知"),
  fixed("spot_hidden", "侦查", 25, "调查与感知"),
  fixed("listen", "聆听", 20, "调查与感知"),
  fixed("stealth", "潜行", 20, "调查与感知"),
  fixed("track", "追踪", 10, "调查与感知"),
  fixed("lip_reading", "读唇", 1, "调查与感知"),
  fixed("library_use", "图书馆使用", 20, "调查与感知"),
  fixed("navigate", "导航", 10, "调查与感知"),
  fixed("computer_use", "计算机使用", 5, "调查与感知"),

  fixed("charm", "取悦", 15, "社交与语言"),
  fixed("fast_talk", "话术", 5, "社交与语言"),
  fixed("intimidate", "恐吓", 15, "社交与语言"),
  fixed("persuade", "说服", 10, "社交与语言"),
  fixed("psychology", "心理学", 10, "社交与语言"),
  fixed("own_language", "母语", 0, "社交与语言", "edu"),
  specialized("other_language", "外语", "社交与语言", languages),
  specialized("other_language_2", "外语", "社交与语言", languages),

  specialized(
    "fighting_brawl",
    "格斗",
    "战斗与行动",
    fightingOptions,
    "斗殴",
  ),
  specialized(
    "fighting_2",
    "格斗",
    "战斗与行动",
    fightingOptions,
    "刀剑",
  ),
  specialized("fighting_3", "格斗", "战斗与行动", fightingOptions),
  specialized(
    "firearms_handgun",
    "射击",
    "战斗与行动",
    firearmsOptions,
    "手枪",
  ),
  specialized(
    "firearms_rifle_shotgun",
    "射击",
    "战斗与行动",
    firearmsOptions,
    "步枪/霰弹枪",
  ),
  specialized("firearms_3", "射击", "战斗与行动", firearmsOptions),
  fixed("dodge", "闪避", 0, "战斗与行动", "half_dex"),
  fixed("throw", "投掷", 20, "战斗与行动"),
  fixed("demolitions", "爆破", 1, "战斗与行动"),
  fixed("run", "跑术", 1, "战斗与行动"),

  fixed("first_aid", "急救", 30, "医疗与体能"),
  fixed("medicine", "医学", 1, "医疗与体能"),
  fixed("psychoanalysis", "精神分析", 1, "医疗与体能"),
  fixed("hypnosis", "催眠", 1, "医疗与体能"),
  fixed("climb", "攀爬", 20, "医疗与体能"),
  fixed("jump", "跳跃", 20, "医疗与体能"),
  fixed("swim", "游泳", 20, "医疗与体能"),
  fixed("diving", "潜水", 1, "医疗与体能"),

  fixed("appraise", "估价", 5, "知识与学术"),
  fixed("anthropology", "人类学", 1, "知识与学术"),
  fixed("accounting", "会计", 5, "知识与学术"),
  fixed("law", "法律", 5, "知识与学术"),
  fixed("history", "历史", 5, "知识与学术"),
  fixed("archaeology", "考古学", 1, "知识与学术"),
  fixed("natural_world", "博物学", 10, "知识与学术"),
  fixed("occult", "神秘学", 5, "知识与学术"),
  fixed("electronics", "电子学", 1, "知识与学术"),
  specialized("science_1", "科学", "知识与学术", scienceOptions),
  specialized("science_2", "科学", "知识与学术", scienceOptions),
  specialized("science_3", "科学", "知识与学术", scienceOptions),

  fixed("disguise", "乔装", 5, "技艺与生存"),
  specialized("survival_1", "生存", "技艺与生存", survivalOptions),
  specialized("survival_2", "生存", "技艺与生存", survivalOptions),
  specialized("survival_3", "生存", "技艺与生存", survivalOptions),
  specialized("art_craft_1", "技艺", "技艺与生存", artOptions),
  specialized("art_craft_2", "技艺", "技艺与生存", artOptions),
  specialized("art_craft_3", "技艺", "技艺与生存", artOptions),
  fixed("sleight_of_hand", "妙手", 10, "技艺与生存"),
  fixed("locksmith", "锁匠", 1, "技艺与生存"),
  fixed("electrical_repair", "电气维修", 10, "技艺与生存"),
  fixed("mechanical_repair", "机械维修", 10, "技艺与生存"),
  fixed("animal_handling", "驯兽", 5, "技艺与生存"),
  fixed("ride", "骑术", 5, "技艺与生存"),

  fixed("operate_heavy_machinery", "操作重型机械", 1, "驾驶与操作"),
  fixed("drive_auto", "汽车驾驶", 20, "驾驶与操作"),
  specialized("pilot", "驾驶", "驾驶与操作", pilotOptions),

  custom("custom_1", "自定义技能 1"),
  custom("custom_2", "自定义技能 2"),
  custom("custom_3", "自定义技能 3"),
];

function asRecord(value: unknown): JsonRecord {
  if (typeof value === "string") {
    try {
      return asRecord(JSON.parse(value) as unknown);
    } catch {
      return {};
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  return {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return value === null || value === undefined ? fallback : String(value);
}

function getSpecialization(
  template: SkillTemplate,
  saved: JsonRecord,
): string {
  const explicit = asString(saved.specialization);
  if (explicit) {
    return explicit;
  }

  const savedName = asString(saved.name);
  const prefix = `${template.label}（`;
  if (savedName.startsWith(prefix) && savedName.endsWith("）")) {
    return savedName.slice(prefix.length, -1);
  }

  return template.defaultSpecialization ?? template.specialization;
}

function getSkillName(
  template: SkillTemplate,
  specialization: string,
  savedName = "",
): string {
  if (template.kind === "custom") {
    return savedName;
  }

  if (template.kind === "specialized" && specialization) {
    return `${template.label}（${specialization}）`;
  }

  return template.label;
}

function getBase(
  template: SkillTemplate,
  specialization: string,
  saved: JsonRecord,
  edu: number,
  dex: number,
): number {
  if (template.baseRule === "edu") {
    return edu;
  }

  if (template.baseRule === "half_dex") {
    return Math.floor(dex / 2);
  }

  if (template.kind === "custom") {
    return asNumber(saved.base, template.base);
  }

  if (template.kind === "specialized") {
    return (
      template.options.find((option) => option.label === specialization)?.base ??
      template.base
    );
  }

  return template.base;
}

export function getCoc7SkillTotal(skill: Coc7SkillDraft): number {
  return skill.base + skill.occupation + skill.interest + skill.growth;
}

export function normalizeCoc7Skills(
  skillsValue: unknown,
  edu: number,
  dex: number,
): Coc7SkillDraft[] {
  const skillsRecord = asRecord(skillsValue);
  const savedSkills = asArray(skillsRecord.skills).map(asRecord);
  const savedByKey = new Map(
    savedSkills.map((skill) => [asString(skill.key), skill]),
  );
  const consumedKeys = new Set<string>();

  const normalized = skillTemplates.map((template) => {
    const saved = savedByKey.get(template.key) ?? {};
    consumedKeys.add(template.key);
    const specialization = getSpecialization(template, saved);
    const savedName = asString(saved.name);

    return {
      key: template.key,
      label: template.label,
      name: getSkillName(template, specialization, savedName),
      category: template.category,
      kind: template.kind,
      baseRule: template.baseRule,
      base: getBase(template, specialization, saved, edu, dex),
      occupation: asNumber(saved.occupation),
      interest: asNumber(saved.interest),
      growth: asNumber(saved.growth),
      checked: saved.checked === true,
      specialization,
      options: template.options,
    };
  });

  const legacyValues = Object.entries(skillsRecord)
    .filter(
      ([key, value]) =>
        !["occupation_points", "interest_points", "skill_limit", "skills"].includes(
          key,
        ) && typeof value !== "object",
    )
    .map(([key, value]) => ({
      key: `legacy_${key}`,
      label: key,
      name: key,
      category: "自定义" as const,
      kind: "custom" as const,
      baseRule: "fixed" as const,
      base: 0,
      occupation: Math.max(0, asNumber(value)),
      interest: 0,
      growth: 0,
      checked: false,
      specialization: "",
      options: [],
    }));

  const unmatchedSaved = savedSkills
    .filter((skill) => {
      const key = asString(skill.key);
      return key && !consumedKeys.has(key);
    })
    .map((skill, index) => ({
      key: asString(skill.key, `legacy_saved_${index}`),
      label: asString(skill.name, "旧版技能"),
      name: asString(skill.name, "旧版技能"),
      category: "自定义" as const,
      kind: "custom" as const,
      baseRule: "fixed" as const,
      base: asNumber(skill.base),
      occupation: asNumber(skill.occupation),
      interest: asNumber(skill.interest),
      growth: asNumber(skill.growth),
      checked: skill.checked === true,
      specialization: "",
      options: [],
    }));

  return [...normalized, ...legacyValues, ...unmatchedSaved];
}

export function refreshCoc7SkillBases(
  skills: Coc7SkillDraft[],
  edu: number,
  dex: number,
): Coc7SkillDraft[] {
  return skills.map((skill) => {
    if (skill.baseRule === "edu") {
      return { ...skill, base: edu };
    }

    if (skill.baseRule === "half_dex") {
      return { ...skill, base: Math.floor(dex / 2) };
    }

    return skill;
  });
}

export function updateCoc7SkillSpecialization(
  skill: Coc7SkillDraft,
  specialization: string,
): Coc7SkillDraft {
  const option = skill.options.find((item) => item.label === specialization);

  return {
    ...skill,
    specialization,
    name: specialization ? `${skill.label}（${specialization}）` : skill.label,
    base: option?.base ?? skill.options[0]?.base ?? 0,
  };
}
