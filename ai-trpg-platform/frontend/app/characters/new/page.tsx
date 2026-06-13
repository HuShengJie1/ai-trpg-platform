"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import { getErrorMessage } from "../../../lib/characterForm";
import { getCharacterRules } from "../../../lib/characters";
import { getAccessToken, logout } from "../../../lib/auth";
import type { SupportedRule } from "../../../types/character";

type PageStatus = "loading" | "missing-token" | "ready" | "invalid-token";

const fallbackRules: SupportedRule[] = [
  {
    id: "coc7",
    name: "COC7",
    description: "克苏鲁的呼唤第七版角色卡。",
  },
  {
    id: "dnd5e",
    name: "DND5E",
    description: "龙与地下城第五版角色卡。",
  },
];

function getRuleCreatePath(ruleId: string): string | null {
  const normalized = ruleId.trim().toLowerCase();

  if (normalized === "coc7") {
    return "/characters/new/coc7";
  }

  if (normalized === "dnd5e") {
    return "/characters/new/dnd5e";
  }

  return null;
}

export default function NewCharacterPage() {
  const [status, setStatus] = useState<PageStatus>("loading");
  const [rules, setRules] = useState<SupportedRule[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setStatus("missing-token");
      return;
    }

    getCharacterRules()
      .then((nextRules) => {
        setRules(nextRules.length > 0 ? nextRules : fallbackRules);
        if (nextRules.length === 0) {
          setWarning("后端没有返回规则列表，已显示默认规则入口。");
        }
        setStatus("ready");
      })
      .catch((caughtError) => {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          logout();
          setStatus("invalid-token");
          return;
        }

        setRules(fallbackRules);
        setWarning(
          `${getErrorMessage(caughtError, "无法读取规则列表。")} 已显示默认规则入口。`,
        );
        setStatus("ready");
      });
  }, []);

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div>
          <Link
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            href="/characters"
          >
            返回角色列表
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-gray-950">
            选择角色规则
          </h1>
        </div>

        {status === "loading" ? (
          <p className="mt-8 text-sm text-gray-600">正在读取可用规则...</p>
        ) : null}

        {status === "missing-token" ? (
          <div className="mt-8 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
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
          <div className="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
            <p>登录状态已失效，请重新登录。</p>
            <Link
              className="mt-3 inline-flex rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800"
              href="/login"
            >
              重新登录
            </Link>
          </div>
        ) : null}

        {status === "ready" ? (
          <div className="mt-8">
            {warning ? (
              <p className="mb-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                {warning}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {rules.map((rule) => {
                const path = getRuleCreatePath(rule.id);

                return (
                  <article
                    key={rule.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-xs font-medium uppercase text-indigo-600">
                      {rule.id}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-950">
                      {rule.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {rule.description}
                    </p>
                    {path ? (
                      <Link
                        className="mt-5 inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        href={path}
                      >
                        选择 {rule.name}
                      </Link>
                    ) : (
                      <p className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        暂不支持这个规则的前端表单。
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
