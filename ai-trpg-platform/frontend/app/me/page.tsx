"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import { getAccessToken, getCurrentUser, logout } from "../../lib/auth";
import type { User } from "../../types/user";

type AccountStatus = "loading" | "missing-token" | "ready" | "invalid-token" | "error";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "无法读取账号信息，请稍后再试。";
}

export default function MePage() {
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setStatus("missing-token");
      return;
    }

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("ready");
      })
      .catch((caughtError) => {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          logout();
          setStatus("invalid-token");
          return;
        }

        setError(getErrorMessage(caughtError));
        setStatus("error");
      });
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">我的账号</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-gray-950">
          当前用户信息
        </h1>

        {status === "loading" ? (
          <p className="mt-6 text-sm text-gray-600">正在读取账号信息...</p>
        ) : null}

        {status === "missing-token" ? (
          <div className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            <p>当前没有登录 token，请先登录。</p>
            <Link
              className="mt-3 inline-flex rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800"
              href="/login"
            >
              去登录
            </Link>
          </div>
        ) : null}

        {status === "invalid-token" ? (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            <p>登录状态已失效，请重新登录。</p>
            <Link
              className="mt-3 inline-flex rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800"
              href="/login"
            >
              重新登录
            </Link>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {status === "ready" && user ? (
          <div className="mt-6 space-y-4">
            <dl className="divide-y divide-gray-100 rounded-md border border-gray-200">
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">用户名</dt>
                <dd className="text-sm text-gray-950 sm:col-span-2">{user.username}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                <dd className="text-sm text-gray-950 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">角色</dt>
                <dd className="text-sm text-gray-950 sm:col-span-2">{user.role}</dd>
              </div>
            </dl>

            <button
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              type="button"
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
