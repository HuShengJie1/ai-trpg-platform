import type { JsonRecord } from "../types/character";

export type InitialFormData<T> = Partial<Record<keyof T, unknown>>;

export function getInitialString<T>(
  data: InitialFormData<T> | undefined,
  key: keyof T,
  fallback: string,
): string {
  const value = data?.[key];

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

export function getInitialNumber<T>(
  data: InitialFormData<T> | undefined,
  key: keyof T,
  fallback: number,
): number {
  const value = data?.[key];
  const numberValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function stringifyInitialJson<T>(
  data: InitialFormData<T> | undefined,
  key: keyof T,
  fallback: JsonRecord,
): string {
  const value = data?.[key] ?? fallback;

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

export function parseJsonObject(label: string, value: string): JsonRecord {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${label} 不是有效 JSON。`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} 必须是 JSON 对象。`);
  }

  return parsed as JsonRecord;
}

export function getErrorMessage(
  error: unknown,
  fallback = "操作失败，请稍后再试。",
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
