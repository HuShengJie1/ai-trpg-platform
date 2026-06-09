import { ApiError, apiFetch } from "./api";
import type {
  AuthToken,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/user";

export const AUTH_TOKEN_STORAGE_KEY = "ai_trpg_access_token";
const AUTH_CHANGE_EVENT = "ai-trpg-auth-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyAuthChanged(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function getAuthChangeEventName(): string {
  return AUTH_CHANGE_EVENT;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function saveAccessToken(token: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  notifyAuthChanged();
}

export function logout(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  notifyAuthChanged();
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export async function register(payload: RegisterPayload): Promise<User> {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthToken> {
  const token = await apiFetch<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAccessToken(token.access_token);

  return token;
}

export async function getCurrentUser(): Promise<User> {
  const token = getAccessToken();

  if (!token) {
    throw new ApiError("请先登录。", 401, null);
  }

  return apiFetch<User>("/auth/me", {
    method: "GET",
    token,
  });
}
