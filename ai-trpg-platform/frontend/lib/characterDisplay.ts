import type { JsonRecord } from "../types/character";

export function asRecord(value: unknown): JsonRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  return {};
}

export function normalizeRuleSystem(ruleSystem: string): string {
  return ruleSystem.trim().toLowerCase();
}

export function formatRuleSystem(ruleSystem: string): string {
  const normalized = normalizeRuleSystem(ruleSystem);

  if (normalized === "coc7") {
    return "COC7";
  }

  if (normalized === "dnd5e") {
    return "DND5E";
  }

  return ruleSystem || "未知规则";
}

export function getCharacterEditPath(
  id: number,
  ruleSystem: string,
): string | null {
  const normalized = normalizeRuleSystem(ruleSystem);

  if (normalized === "coc7") {
    return `/characters/${id}/edit/coc7`;
  }

  if (normalized === "dnd5e") {
    return `/characters/${id}/edit/dnd5e`;
  }

  return null;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function fieldText(
  record: JsonRecord,
  key: string,
  fallback = "未填写",
): string {
  const value = record[key];

  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

export function formatJsonValue(value: unknown): string {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value ?? {}, null, 2);
}
