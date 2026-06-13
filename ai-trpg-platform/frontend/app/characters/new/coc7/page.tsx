"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Coc7CharacterForm from "../../../../components/characters/Coc7CharacterForm";
import { createCoc7Character } from "../../../../lib/characters";
import { getAccessToken } from "../../../../lib/auth";
import type { Coc7CharacterCreate } from "../../../../types/character";

type PageStatus = "checking" | "missing-token" | "ready";

export default function NewCoc7CharacterPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("checking");

  useEffect(() => {
    setStatus(getAccessToken() ? "ready" : "missing-token");
  }, []);

  const handleSubmit = async (data: Coc7CharacterCreate) => {
    await createCoc7Character(data);
    router.push("/characters");
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Link
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          href="/characters/new"
        >
          返回规则选择
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-gray-950">
          创建 COC7 角色
        </h1>

        {status === "checking" ? (
          <p className="mt-6 text-sm text-gray-600">正在检查登录状态...</p>
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

        {status === "ready" ? (
          <div className="mt-8">
            <Coc7CharacterForm
              submitLabel="创建 COC7 角色"
              onSubmit={handleSubmit}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
