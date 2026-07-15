import { ApiError, apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type {
  CharacterListItem,
  CharacterRead,
  Coc7CharacterCreate,
  Coc7CharacterUpdate,
  Coc7Occupation,
  Dnd5eCharacterCreate,
  Dnd5eCharacterUpdate,
  SupportedRule,
} from "../types/character";
import { normalizeCoc7Occupation } from "./coc7Occupations";

type CharacterRulesResponse = SupportedRule[] | { rules: SupportedRule[] };

function getRequiredToken(): string {
  const token = getAccessToken();

  if (!token) {
    throw new ApiError("请先登录后再访问角色卡。", 401, null);
  }

  return token;
}

function normalizeRules(response: CharacterRulesResponse): SupportedRule[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.rules;
}

export async function getCharacterRules(): Promise<SupportedRule[]> {
  const token = getRequiredToken();
  const response = await apiFetch<CharacterRulesResponse>("/characters/rules", {
    method: "GET",
    token,
  });

  return normalizeRules(response);
}

export async function getCoc7Occupations(
  search?: string,
): Promise<Coc7Occupation[]> {
  const token = getRequiredToken();
  const query = search?.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";
  const response = await apiFetch<unknown>(
    `/characters/coc7/occupations${query}`,
    { method: "GET", token },
  );
  const values = Array.isArray(response)
    ? response
    : Array.isArray((response as { occupations?: unknown[] })?.occupations)
      ? (response as { occupations: unknown[] }).occupations
      : [];

  return values.flatMap((value) => {
    const occupation = normalizeCoc7Occupation(value);
    return occupation ? [occupation] : [];
  });
}

export async function getCoc7Occupation(id: number): Promise<Coc7Occupation> {
  const token = getRequiredToken();
  const response = await apiFetch<unknown>(`/characters/coc7/occupations/${id}`, {
    method: "GET",
    token,
  });
  const occupation = normalizeCoc7Occupation(response);
  if (!occupation) {
    throw new ApiError("职业资料格式不正确。", 500, response);
  }

  return occupation;
}

export async function createCoc7Character(
  data: Coc7CharacterCreate,
): Promise<CharacterRead> {
  const token = getRequiredToken();

  return apiFetch<CharacterRead>("/characters/coc7", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function createDnd5eCharacter(
  data: Dnd5eCharacterCreate,
): Promise<CharacterRead> {
  const token = getRequiredToken();

  return apiFetch<CharacterRead>("/characters/dnd5e", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function listCharacters(): Promise<CharacterListItem[]> {
  const token = getRequiredToken();

  return apiFetch<CharacterListItem[]>("/characters", {
    method: "GET",
    token,
  });
}

export async function getCharacter(id: number): Promise<CharacterRead> {
  const token = getRequiredToken();

  return apiFetch<CharacterRead>(`/characters/${id}`, {
    method: "GET",
    token,
  });
}

export async function updateCoc7Character(
  id: number,
  data: Coc7CharacterUpdate,
): Promise<CharacterRead> {
  const token = getRequiredToken();

  return apiFetch<CharacterRead>(`/characters/coc7/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateDnd5eCharacter(
  id: number,
  data: Dnd5eCharacterUpdate,
): Promise<CharacterRead> {
  const token = getRequiredToken();

  return apiFetch<CharacterRead>(`/characters/dnd5e/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteCharacter(id: number): Promise<void> {
  const token = getRequiredToken();

  await apiFetch<unknown>(`/characters/${id}`, {
    method: "DELETE",
    token,
  });
}
