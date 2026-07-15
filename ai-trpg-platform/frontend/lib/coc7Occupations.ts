import type {
  Coc7Occupation,
  Coc7OccupationAttribute,
  Coc7OccupationFormula,
  Coc7OccupationFormulaTerm,
  Coc7OccupationPointCalculation,
  JsonRecord,
} from "../types/character";
import type { Coc7SkillDraft } from "./coc7Skills";

export const coc7OccupationAttributeLabels: Record<
  Coc7OccupationAttribute,
  string
> = {
  str: "力量",
  dex: "敏捷",
  app: "外貌",
  pow: "意志",
  edu: "教育",
};

type Coc7OccupationAttributeValues = Record<Coc7OccupationAttribute, number>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function asString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function asAttribute(value: unknown): Coc7OccupationAttribute | null {
  return value === "str" ||
    value === "dex" ||
    value === "app" ||
    value === "pow" ||
    value === "edu"
    ? value
    : null;
}

export function normalizeCoc7Occupation(value: unknown): Coc7Occupation | null {
  const record = asRecord(value);
  const id = asNumber(record.id);
  const name = asString(record.name);
  if (!Number.isInteger(id) || id <= 0 || !name) {
    return null;
  }

  const formulaRecord = asRecord(record.skill_points_formula_json);
  const terms: Coc7OccupationFormulaTerm[] = Array.isArray(formulaRecord.terms)
    ? formulaRecord.terms.reduce<Coc7OccupationFormulaTerm[]>((result, rawTerm) => {
        const term = asRecord(rawTerm);
        const multiplier = asNumber(term.multiplier);
        const attribute = asAttribute(term.attribute);
        if (attribute) {
          result.push({ attribute, multiplier });
          return result;
        }

        const chooseOne = Array.isArray(term.choose_one)
          ? term.choose_one
              .map(asAttribute)
              .filter(
                (item): item is Coc7OccupationAttribute => item !== null,
              )
          : [];
        if (chooseOne.length > 0) {
          result.push({ choose_one: chooseOne, multiplier });
        }
        return result;
      }, [])
    : [];
  const formulaType = formulaRecord.type;
  const formula: Coc7OccupationFormula = {
    type:
      formulaType === "sum" || formulaType === "choice"
        ? formulaType
        : "fixed",
    terms,
  };
  const rawSkills = Array.isArray(record.occupation_skills)
    ? record.occupation_skills
    : Array.isArray(record.occupation_skills_json)
      ? record.occupation_skills_json
      : [];

  return {
    id,
    name,
    description: asString(record.description),
    skill_points_formula: asString(record.skill_points_formula),
    skill_points_formula_json: formula,
    credit_min: asNumber(record.credit_min),
    credit_max: asNumber(record.credit_max),
    credit_note: asString(record.credit_note) || null,
    occupation_skills: rawSkills.map(asString).filter(Boolean),
    created_at: asString(record.created_at) || undefined,
    updated_at: asString(record.updated_at) || undefined,
  };
}

export function calculateCoc7OccupationPoints(
  occupation: Coc7Occupation,
  attributes: Coc7OccupationAttributeValues,
): Coc7OccupationPointCalculation {
  const parts: string[] = [];
  const selectedFrom: Coc7OccupationAttribute[] = [];
  let selectedAttribute: Coc7OccupationAttribute | null = null;
  let total = 0;

  for (const term of occupation.skill_points_formula_json.terms) {
    let attribute: Coc7OccupationAttribute;
    if ("attribute" in term) {
      attribute = term.attribute;
    } else {
      attribute = term.choose_one.reduce((best, candidate) =>
        attributes[candidate] > attributes[best] ? candidate : best,
      );
      selectedAttribute = attribute;
      selectedFrom.push(...term.choose_one);
    }

    const value = attributes[attribute];
    total += value * term.multiplier;
    parts.push(
      `${coc7OccupationAttributeLabels[attribute]} ${value}×${term.multiplier}`,
    );
  }

  return {
    formula: occupation.skill_points_formula,
    selected_attribute: selectedAttribute,
    selected_from: selectedFrom,
    calculation: parts.length > 0 ? `${parts.join("＋")}＝${total}` : "无法计算",
    total,
  };
}

const skillAliases: Record<string, string> = {
  图书馆: "图书馆使用",
  心理: "心理学",
  自然: "博物学",
  动物驯养: "驯兽",
  艺术: "技艺",
  工艺: "技艺",
};

const occupationRuleSkillAliases: Record<string, string[]> = {
  取悦: ["取悦", "魅惑"],
  技艺: ["技艺", "艺术", "工艺"],
  骑术: ["骑术", "骑乘"],
  博物学: ["博物学", "自然"],
  驯兽: ["驯兽", "动物驯养"],
  图书馆使用: ["图书馆使用", "图书馆"],
  心理学: ["心理学", "心理"],
};

const choiceRulePattern =
  /任意|任选|任一|一项|两项|三项|四项|各一|其他|技能[（(]|或|\/|、/;

function normalizeSkillName(value: string): string {
  return value.replace(/\s+/g, "").replace(/[()]/g, (character) =>
    character === "(" ? "（" : "）",
  );
}

export function findFixedOccupationSkillKeys(
  rules: string[],
  skills: Coc7SkillDraft[],
): Set<string> {
  const keys = new Set<string>();

  for (const rawRule of rules) {
    const key = findFixedOccupationSkillKey(rawRule, skills);
    if (key) keys.add(key);
  }

  return keys;
}

export function findFixedOccupationSkillKey(
  rawRule: string,
  skills: Coc7SkillDraft[],
): string | null {
  const rule = normalizeSkillName(rawRule.replace(/[。；;]$/, ""));
  if (!rule || choiceRulePattern.test(rule)) {
    return null;
  }

  const aliasedRule = skillAliases[rule] ?? rule;
  const matches = skills.filter((skill) =>
    [skill.name, skill.label].map(normalizeSkillName).includes(aliasedRule),
  );
  return matches.length === 1 ? matches[0].key : null;
}

export function getOccupationChoiceCount(rule: string): number {
  const normalized = normalizeSkillName(rule);
  if (/四项|四个/.test(normalized)) return 4;
  if (/三项|三个/.test(normalized)) return 3;
  if (/两项|两个/.test(normalized)) return 2;
  return 1;
}

function getRuleChoiceText(rule: string): string {
  const normalized = normalizeSkillName(rule);
  const separatorIndex = Math.max(
    normalized.lastIndexOf("："),
    normalized.lastIndexOf(":"),
  );
  return separatorIndex >= 0 ? normalized.slice(separatorIndex + 1) : normalized;
}

function skillMatchesOccupationRule(
  rule: string,
  skill: Coc7SkillDraft,
): boolean {
  const ruleChoiceText = getRuleChoiceText(rule);
  const normalizedName = normalizeSkillName(skill.name);
  const normalizedLabel = normalizeSkillName(skill.label);
  const aliases = occupationRuleSkillAliases[normalizedLabel] ?? [normalizedLabel];

  if (normalizedName && ruleChoiceText.includes(normalizedName)) {
    return true;
  }

  return aliases.some((alias) => alias && ruleChoiceText.includes(alias));
}

export function isOccupationSkillRuleSatisfied(
  rule: string,
  skills: Coc7SkillDraft[],
  fixedSkillKeys: Set<string>,
): boolean {
  const fixedSkillKey = findFixedOccupationSkillKey(rule, skills);
  if (fixedSkillKey) {
    return skills.some(
      (skill) => skill.key === fixedSkillKey && skill.isOccupation,
    );
  }

  const requiredCount = getOccupationChoiceCount(rule);
  const candidateSkills = skills.filter((skill) =>
    skillMatchesOccupationRule(rule, skill),
  );
  if (candidateSkills.length > 0) {
    return (
      candidateSkills.filter((skill) => skill.isOccupation).length >=
      requiredCount
    );
  }

  return (
    skills.filter(
      (skill) => skill.isOccupation && !fixedSkillKeys.has(skill.key),
    ).length >= requiredCount
  );
}
