"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAccessToken,
  getAuthChangeEventName,
  logout,
} from "../lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setHasToken(Boolean(getAccessToken()));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(getAuthChangeEventName(), syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(getAuthChangeEventName(), syncAuthState);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-base font-semibold text-gray-950">
          AI 跑团平台
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="text-gray-600 hover:text-gray-950" href="/">
            首页
          </Link>

          {hasToken ? (
            <>
              <Link className="text-gray-600 hover:text-gray-950" href="/characters">
                角色卡
              </Link>
              <Link className="text-gray-600 hover:text-gray-950" href="/me">
                我的账号
              </Link>
              <button
                className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                type="button"
                onClick={handleLogout}
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <Link className="text-gray-600 hover:text-gray-950" href="/register">
                注册
              </Link>
              <Link
                className="rounded-md bg-gray-950 px-3 py-1.5 font-medium text-white hover:bg-gray-800"
                href="/login"
              >
                登录
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
