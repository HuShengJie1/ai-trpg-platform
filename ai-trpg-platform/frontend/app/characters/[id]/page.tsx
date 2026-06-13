"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Coc7SheetView from "../../../components/characters/Coc7SheetView";
import Dnd5eSheetView from "../../../components/characters/Dnd5eSheetView";
import { ApiError } from "../../../lib/api";
import {
  formatDateTime,
  formatRuleSystem,
  getCharacterEditPath,
  normalizeRuleSystem,
} from "../../../lib/characterDisplay";
import { getErrorMessage } from "../../../lib/characterForm";
import { getCharacter } from "../../../lib/characters";
import { getAccessToken, logout } from "../../../lib/auth";
import type { CharacterRead } from "../../../types/character";

type PageStatus =
  | "loading"
  | "missing-token"
  | "ready"
  | "invalid-token"
  | "error";

type CharacterDetailPageProps = {
  params: {
    id: string;
  };
};

function SheetView({ character }: { character: CharacterRead }) {
  const ruleSystem = normalizeRuleSystem(character.rule_system);

  if (ruleSystem === "coc7") {
    return <Coc7SheetView sheet={character.sheet} />;
  }

  if (ruleSystem === "dnd5e") {
    return <Dnd5eSheetView sheet={character.sheet} />;
  }

  return (
    <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
      不支持的角色规则。
    </p>
  );
}

export default function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const characterId = Number(params.id);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [character, setCharacter] = useState<CharacterRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(characterId) || characterId <= 0) {
      setError("角色 ID 不正确。");
      setStatus("error");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setStatus("missing-token");
      return;
    }

    getCharacter(characterId)
      .then((nextCharacter) => {
        setCharacter(nextCharacter);
        setStatus("ready");
      })
      .catch((caughtError) => {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          logout();
          setStatus("invalid-token");
          return;
        }

        setError(getErrorMessage(caughtError, "无法读取角色详情。"));
        setStatus("error");
      });
  }, [characterId]);

  const editPath = character
    ? getCharacterEditPath(character.id, character.rule_system)
    : null;

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              href="/characters"
            >
              返回角色列表
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-gray-950">
              {character?.name ?? "角色详情"}
            </h1>
          </div>

          {editPath ? (
            <Link
              className="inline-flex w-fit rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              href={editPath}
            >
              编辑角色
            </Link>
          ) : null}
        </div>

        {status === "loading" ? (
          <p className="mt-8 text-sm text-gray-600">正在读取角色详情...</p>
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

        {status === "error" && error ? (
          <p className="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {status === "ready" && character ? (
          <div className="mt-8 space-y-8">
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-gray-50 px-3 py-2">
                <dt className="text-xs text-gray-500">规则</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formatRuleSystem(character.rule_system)}
                </dd>
              </div>
              <div className="rounded-md bg-gray-50 px-3 py-2">
                <dt className="text-xs text-gray-500">创建时间</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formatDateTime(character.created_at)}
                </dd>
              </div>
              <div className="rounded-md bg-gray-50 px-3 py-2">
                <dt className="text-xs text-gray-500">更新时间</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {formatDateTime(character.updated_at)}
                </dd>
              </div>
            </dl>

            <SheetView character={character} />

            {!editPath ? (
              <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                不支持的角色规则，暂时无法编辑。
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
