"use client";

import Link from "next/link";
import {
  asRecord,
  fieldText,
  formatDateTime,
  formatRuleSystem,
  getCharacterEditPath,
  normalizeRuleSystem,
} from "../../lib/characterDisplay";
import type { CharacterListItem } from "../../types/character";

type CharacterSummaryCardProps = {
  character: CharacterListItem;
  deleting: boolean;
  onDelete: (character: CharacterListItem) => void;
};

function getSummaryItems(character: CharacterListItem): Array<[string, string]> {
  const summary = asRecord(character.summary);
  const ruleSystem = normalizeRuleSystem(character.rule_system);

  if (ruleSystem === "coc7") {
    return [
      ["职业", fieldText(summary, "occupation")],
      ["年龄", fieldText(summary, "age")],
      ["HP", fieldText(summary, "hp")],
      ["MP", fieldText(summary, "mp")],
      ["SAN", fieldText(summary, "san")],
    ];
  }

  if (ruleSystem === "dnd5e") {
    return [
      ["种族", fieldText(summary, "race")],
      ["职业", fieldText(summary, "class_name")],
      ["等级", fieldText(summary, "level")],
      ["HP", fieldText(summary, "current_hp")],
      ["AC", fieldText(summary, "armor_class")],
    ];
  }

  return Object.entries(summary)
    .slice(0, 5)
    .map(([key, value]) => [key, String(value)]);
}

export default function CharacterSummaryCard({
  character,
  deleting,
  onDelete,
}: CharacterSummaryCardProps) {
  const editPath = getCharacterEditPath(character.id, character.rule_system);
  const summaryItems = getSummaryItems(character);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-indigo-600">
            {formatRuleSystem(character.rule_system)}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-gray-950">
            {character.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            创建于 {formatDateTime(character.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            href={`/characters/${character.id}`}
          >
            查看详情
          </Link>
          {editPath ? (
            <Link
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              href={editPath}
            >
              编辑
            </Link>
          ) : (
            <span className="rounded-md bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
              不支持的角色规则
            </span>
          )}
          <button
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={deleting}
            type="button"
            onClick={() => onDelete(character)}
          >
            {deleting ? "删除中..." : "删除"}
          </button>
        </div>
      </div>

      {summaryItems.length > 0 ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summaryItems.map(([label, value]) => (
            <div key={label} className="rounded-md bg-gray-50 px-3 py-2">
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-gray-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 text-sm text-gray-500">暂无摘要信息。</p>
      )}
    </article>
  );
}
