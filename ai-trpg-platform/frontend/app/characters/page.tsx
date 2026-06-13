"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CharacterSummaryCard from "../../components/characters/CharacterSummaryCard";
import { ApiError } from "../../lib/api";
import { getErrorMessage } from "../../lib/characterForm";
import { deleteCharacter, listCharacters } from "../../lib/characters";
import { getAccessToken, logout } from "../../lib/auth";
import type { CharacterListItem } from "../../types/character";

type PageStatus = "loading" | "missing-token" | "ready" | "invalid-token" | "error";

export default function CharactersPage() {
  const [status, setStatus] = useState<PageStatus>("loading");
  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCharacters = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setStatus("missing-token");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const nextCharacters = await listCharacters();
      setCharacters(nextCharacters);
      setStatus("ready");
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        logout();
        setStatus("invalid-token");
        return;
      }

      setError(getErrorMessage(caughtError, "无法读取角色列表。"));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void fetchCharacters();
  }, [fetchCharacters]);

  const handleDelete = async (character: CharacterListItem) => {
    const confirmed = window.confirm(`确定删除角色「${character.name}」吗？`);

    if (!confirmed) {
      return;
    }

    setDeletingId(character.id);
    setError(null);

    try {
      await deleteCharacter(character.id);
      await fetchCharacters();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "删除角色失败。"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">角色卡</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-gray-950">
              我的角色卡
            </h1>
          </div>

          <Link
            className="inline-flex w-fit rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            href="/characters/new"
          >
            创建角色
          </Link>
        </div>

        {status === "loading" ? (
          <p className="mt-8 text-sm text-gray-600">正在读取角色列表...</p>
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

        {status === "ready" ? (
          <div className="mt-8 space-y-4">
            {error ? (
              <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {characters.length > 0 ? (
              characters.map((character) => (
                <CharacterSummaryCard
                  key={character.id}
                  character={character}
                  deleting={deletingId === character.id}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-600">还没有角色卡。</p>
                <Link
                  className="mt-4 inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  href="/characters/new"
                >
                  创建第一个角色
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
