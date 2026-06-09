export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatApiError(body: unknown): string {
  if (typeof body === "string") {
    return body;
  }

  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }

          return String(item);
        })
        .join("；");
    }

    if (detail) {
      return JSON.stringify(detail);
    }
  }

  return "请求失败，请稍后再试。";
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { headers, token, body, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      body,
      headers: requestHeaders,
    });
  } catch (error) {
    throw new ApiError(
      "无法连接后端服务，请确认 API 地址和后端服务状态。",
      0,
      error,
    );
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(formatApiError(responseBody), response.status, responseBody);
  }

  return responseBody as T;
}
