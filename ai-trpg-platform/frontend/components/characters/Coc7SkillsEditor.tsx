"use client";

import { useState } from "react";
import {
  coc7SkillCategories,
  getCoc7SkillTotal,
  type Coc7SkillCategory,
  type Coc7SkillDraft,
} from "../../lib/coc7Skills";

type Coc7SkillsEditorProps = {
  disabled: boolean;
  skills: Coc7SkillDraft[];
  onChange: (index: number, skill: Coc7SkillDraft) => void;
};

function getHalf(value: number): number {
  return Math.floor(value / 2);
}

function getFifth(value: number): number {
  return Math.floor(value / 5);
}

function SkillNameControl({
  disabled,
  skill,
  onChange,
}: {
  disabled: boolean;
  skill: Coc7SkillDraft;
  onChange: (skill: Coc7SkillDraft) => void;
}) {
  if (skill.kind === "specialized") {
    return (
      <label className="block">
        <span className="sr-only">{skill.label}专精</span>
        <select
          className="w-full min-w-36 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          disabled={disabled}
          value={skill.specialization}
          onChange={(event) =>
            onChange({
              ...skill,
              specialization: event.target.value,
              name: event.target.value
                ? `${skill.label}（${event.target.value}）`
                : skill.label,
              base:
                skill.options.find(
                  (option) => option.label === event.target.value,
                )?.base ??
                skill.options[0]?.base ??
                0,
            })
          }
        >
          <option value="">{skill.label}：请选择</option>
          {skill.options.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (skill.kind === "custom") {
    return (
      <label className="block">
        <span className="sr-only">{skill.label}名称</span>
        <input
          className="w-full min-w-36 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          disabled={disabled}
          placeholder={skill.label}
          type="text"
          value={skill.name}
          onChange={(event) => onChange({ ...skill, name: event.target.value })}
        />
      </label>
    );
  }

  return <span className="font-medium text-stone-900">{skill.name}</span>;
}

function ScoreInput({
  disabled,
  label,
  value,
  onChange,
}: {
  disabled: boolean;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        className="w-16 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-center text-sm text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        disabled={disabled}
        min={0}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          onChange(Number.isFinite(nextValue) ? nextValue : 0);
        }}
      />
    </label>
  );
}

export default function Coc7SkillsEditor({
  disabled,
  skills,
  onChange,
}: Coc7SkillsEditorProps) {
  const [activeCategory, setActiveCategory] = useState<Coc7SkillCategory>(
    coc7SkillCategories[0],
  );
  const visibleSkills = skills
    .map((skill, index) => ({ skill, index }))
    .filter(({ skill }) => skill.category === activeCategory);

  return (
    <div>
      <div
        aria-label="技能分类"
        className="flex gap-2 overflow-x-auto border-b border-stone-300 pb-3"
        role="tablist"
      >
        {coc7SkillCategories.map((category) => {
          const isActive = activeCategory === category;
          const count = skills.filter(
            (skill) => skill.category === category,
          ).length;

          return (
            <button
              key={category}
              aria-selected={isActive}
              className={`shrink-0 border-b-2 px-2 py-1.5 text-sm font-medium ${
                isActive
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
              role="tab"
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
              <span className="ml-1 text-xs text-stone-400">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-md border border-stone-300 bg-white md:block">
        <table className="min-w-[850px] w-full border-collapse text-left text-sm">
          <thead className="bg-stone-900 text-stone-100">
            <tr>
              <th className="w-48 px-3 py-2 font-medium">技能名称</th>
              <th className="px-3 py-2 text-center font-medium">基础</th>
              <th className="px-3 py-2 text-center font-medium">职业</th>
              <th className="px-3 py-2 text-center font-medium">兴趣</th>
              <th className="px-3 py-2 text-center font-medium">成长</th>
              <th className="px-3 py-2 text-center font-medium">总值</th>
              <th className="px-3 py-2 text-center font-medium">半值</th>
              <th className="px-3 py-2 text-center font-medium">五分之一</th>
              <th className="px-3 py-2 text-center font-medium">标记</th>
            </tr>
          </thead>
          <tbody>
            {visibleSkills.map(({ skill, index }) => {
              const total = getCoc7SkillTotal(skill);

              return (
                <tr key={skill.key} className="border-t border-stone-200">
                  <td className="px-3 py-2">
                    <SkillNameControl
                      disabled={disabled}
                      skill={skill}
                      onChange={(nextSkill) => onChange(index, nextSkill)}
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-medium text-stone-700">
                    {skill.kind === "custom" ? (
                      <ScoreInput
                        disabled={disabled}
                        label={`${skill.label}基础值`}
                        value={skill.base}
                        onChange={(base) => onChange(index, { ...skill, base })}
                      />
                    ) : (
                      skill.base
                    )}
                  </td>
                  {(["occupation", "interest", "growth"] as const).map(
                    (field) => (
                      <td key={field} className="px-3 py-2 text-center">
                        <ScoreInput
                          disabled={disabled}
                          label={`${skill.name || skill.label}${field}`}
                          value={skill[field]}
                          onChange={(value) =>
                            onChange(index, { ...skill, [field]: value })
                          }
                        />
                      </td>
                    ),
                  )}
                  <td className="px-3 py-2 text-center font-semibold text-stone-950">
                    {total}
                  </td>
                  <td className="px-3 py-2 text-center text-stone-700">
                    {getHalf(total)}
                  </td>
                  <td className="px-3 py-2 text-center text-stone-700">
                    {getFifth(total)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      aria-label={`${skill.name || skill.label}标记`}
                      checked={skill.checked}
                      className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                      disabled={disabled}
                      type="checkbox"
                      onChange={(event) =>
                        onChange(index, {
                          ...skill,
                          checked: event.target.checked,
                        })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {visibleSkills.map(({ skill, index }) => {
          const total = getCoc7SkillTotal(skill);

          return (
            <article
              key={skill.key}
              className="rounded-md border border-stone-300 bg-white p-3"
            >
              <SkillNameControl
                disabled={disabled}
                skill={skill}
                onChange={(nextSkill) => onChange(index, nextSkill)}
              />
              <dl className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded bg-stone-100 px-1 py-2">
                  <dt className="text-stone-500">基础</dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {skill.base}
                  </dd>
                </div>
                <div className="rounded bg-stone-100 px-1 py-2">
                  <dt className="text-stone-500">总值</dt>
                  <dd className="mt-1 font-semibold text-stone-900">{total}</dd>
                </div>
                <div className="rounded bg-stone-100 px-1 py-2">
                  <dt className="text-stone-500">半值</dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {getHalf(total)}
                  </dd>
                </div>
                <div className="rounded bg-stone-100 px-1 py-2">
                  <dt className="text-stone-500">五分之一</dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {getFifth(total)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["occupation", "interest", "growth"] as const).map(
                  (field) => (
                    <label key={field} className="text-xs text-stone-600">
                      {field === "occupation"
                        ? "职业"
                        : field === "interest"
                          ? "兴趣"
                          : "成长"}
                      <input
                        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-center text-sm text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        disabled={disabled}
                        min={0}
                        type="number"
                        value={skill[field]}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          onChange(index, {
                            ...skill,
                            [field]: Number.isFinite(value) ? value : 0,
                          });
                        }}
                      />
                    </label>
                  ),
                )}
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
                <input
                  checked={skill.checked}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  disabled={disabled}
                  type="checkbox"
                  onChange={(event) =>
                    onChange(index, {
                      ...skill,
                      checked: event.target.checked,
                    })
                  }
                />
                已标记
              </label>
            </article>
          );
        })}
      </div>
    </div>
  );
}
