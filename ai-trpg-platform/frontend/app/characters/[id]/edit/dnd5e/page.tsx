"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dnd5eCharacterForm from "../../../../../components/characters/Dnd5eCharacterForm";
import { ApiError } from "../../../../../lib/api";
import { asRecord, normalizeRuleSystem } from "../../../../../lib/characterDisplay";
import {
  getErrorMessage,
  type InitialFormData,
} from "../../../../../lib/characterForm";
import {
  getCharacter,
  updateDnd5eCharacter,
} from "../../../../../lib/characters";
import { getAccessToken, logout } from "../../../../../lib/auth";
import type {
  CharacterRead,
  Dnd5eCharacterCreate,
} from "../../../../../types/character";

type PageStatus =
  | "loading"
  | "missing-token"
  | "ready"
  | "invalid-token"
  | "wrong-rule"
  | "error";

type EditDnd5eCharacterPageProps = {
  params: {
    id: string;
  };
};

function toInitialData(
  character: CharacterRead,
): InitialFormData<Dnd5eCharacterCreate> {
  return {
    ...asRecord(character.sheet),
    name: character.name,
  };
}

export default function EditDnd5eCharacterPage({
  params,
}: EditDnd5eCharacterPageProps) {
  const router = useRouter();
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
        if (normalizeRuleSystem(nextCharacter.rule_system) !== "dnd5e") {
          setCharacter(nextCharacter);
          setStatus("wrong-rule");
          return;
        }

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

  const handleSubmit = async (data: Dnd5eCharacterCreate) => {
    await updateDnd5eCharacter(characterId, data);
    router.push(`/characters/${characterId}`);
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Link
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          href={`/characters/${characterId}`}
        >
          返回角色详情
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-gray-950">
          编辑 DND5E 角色
        </h1>

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

        {status === "wrong-rule" && character ? (
          <div className="mt-8 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            <p>这个角色不是 DND5E 角色，不能使用 DND5E 表单编辑。</p>
            <Link
              className="mt-3 inline-flex rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800"
              href={`/characters/${character.id}`}
            >
              查看角色详情
            </Link>
          </div>
        ) : null}

        {status === "error" && error ? (
          <p className="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {status === "ready" && character ? (
          <div className="mt-8">
            <Dnd5eCharacterForm
              initialData={toInitialData(character)}
              submitLabel="保存 DND5E 角色"
              onSubmit={handleSubmit}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
