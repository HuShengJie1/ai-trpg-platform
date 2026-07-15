"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import type { Coc7Occupation } from "../../types/character";
import styles from "./Coc7Theme.module.css";

type Coc7OccupationSelectProps = {
  disabled: boolean;
  occupations: Coc7Occupation[];
  selected: Coc7Occupation | null;
  legacyName: string;
  status: "loading" | "ready" | "error";
  error: string | null;
  onRetry: () => void;
  onSelect: (occupation: Coc7Occupation) => void;
};

export default function Coc7OccupationSelect({
  disabled,
  occupations,
  selected,
  legacyName,
  status,
  error,
  onRetry,
  onSelect,
}: Coc7OccupationSelectProps) {
  const [query, setQuery] = useState(selected?.name ?? legacyName);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected?.name ?? legacyName);
  }, [legacyName, selected?.name]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selected?.name ?? legacyName);
    }
  }, [isOpen, legacyName, selected?.name]);

  useEffect(() => {
    const closeWhenOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeWhenOutside);
    return () => document.removeEventListener("mousedown", closeWhenOutside);
  }, []);

  const filtered = deferredQuery
    ? occupations.filter((occupation) =>
        occupation.name.toLocaleLowerCase("zh-CN").includes(deferredQuery),
      )
    : occupations;
  const visibleOptions = filtered.slice(0, 30);

  const choose = (occupation: Coc7Occupation) => {
    setQuery(occupation.name);
    setIsOpen(false);
    onSelect(occupation);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.occupationSelect} relative lg:col-span-2`}
    >
      <label className="block text-sm font-medium text-stone-700" htmlFor="coc7-occupation-search">
        职业
      </label>
      <input
        id="coc7-occupation-search"
        aria-autocomplete="list"
        aria-controls="coc7-occupation-options"
        aria-expanded={isOpen}
        autoComplete="off"
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-100"
        disabled={disabled || status === "loading"}
        placeholder={status === "loading" ? "正在加载职业目录..." : "输入职业名称搜索"}
        role="combobox"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) =>
              Math.min(current + 1, Math.max(visibleOptions.length - 1, 0)),
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && isOpen && visibleOptions[activeIndex]) {
            event.preventDefault();
            choose(visibleOptions[activeIndex]);
          } else if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      />

      {status === "error" ? (
        <div className="mt-2 flex items-center gap-3 text-xs text-red-700">
          <span>{error ?? "职业目录加载失败。"}</span>
          <button className="font-medium underline" type="button" onClick={onRetry}>
            重新加载
          </button>
        </div>
      ) : null}

      {status === "ready" && occupations.length === 0 ? (
        <p className="mt-2 text-xs text-amber-700">职业目录暂无可用数据。</p>
      ) : null}

      {!selected && legacyName ? (
        <p className="mt-2 text-xs text-amber-700">
          这是旧角色保存的职业文字，请从目录中重新选择以启用自动计算。
        </p>
      ) : null}

      {isOpen && status === "ready" ? (
        <div
          id="coc7-occupation-options"
          className={`${styles.occupationDropdown} absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-stone-300 bg-white py-1 shadow-lg`}
          role="listbox"
        >
          {visibleOptions.length > 0 ? (
            visibleOptions.map((occupation, index) => (
              <button
                key={occupation.id}
                aria-selected={selected?.id === occupation.id}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  index === activeIndex
                    ? "bg-emerald-50 text-emerald-950"
                    : "text-stone-900 hover:bg-stone-50"
                }`}
                role="option"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(occupation)}
              >
                <span className="font-medium">{occupation.name}</span>
                <span className="ml-2 text-xs text-stone-500">
                  信用 {occupation.credit_min}-{occupation.credit_max}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-stone-500">没有匹配的职业。</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
