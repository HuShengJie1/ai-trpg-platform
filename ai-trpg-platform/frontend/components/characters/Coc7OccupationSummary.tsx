"use client";

import { useEffect, useState } from "react";
import { getCoc7Occupation } from "../../lib/characters";
import { getErrorMessage } from "../../lib/characterForm";
import type {
  Coc7Occupation,
  Coc7OccupationPointCalculation,
} from "../../types/character";
import styles from "./Coc7Theme.module.css";

type Coc7OccupationSummaryProps = {
  initialOccupation?: Coc7Occupation | null;
  occupationId: number | null;
  occupationName: string;
  occupationPoints: number;
  calculation?: Coc7OccupationPointCalculation | null;
};

export default function Coc7OccupationSummary({
  initialOccupation = null,
  occupationId,
  occupationName,
  occupationPoints,
  calculation = null,
}: Coc7OccupationSummaryProps) {
  const [occupation, setOccupation] = useState(initialOccupation);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOccupation || !occupationId) return;
    let isCurrent = true;
    getCoc7Occupation(occupationId)
      .then((value) => {
        if (isCurrent) setOccupation(value);
      })
      .catch((caughtError) => {
        if (isCurrent) {
          setError(getErrorMessage(caughtError, "无法读取职业资料。"));
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [initialOccupation, occupationId]);

  if (!occupationId && !occupation) {
    return occupationName ? (
      <p className="mt-3 text-sm text-amber-700">
        这是旧角色保存的职业文字，尚未关联职业目录。
      </p>
    ) : null;
  }

  if (!occupation) {
    return (
      <p className={`mt-3 text-sm ${error ? "text-amber-700" : "text-gray-500"}`}>
        {error ?? "正在读取职业资料..."}
      </p>
    );
  }

  return (
    <div
      className={`${styles.occupationSummary} mt-4 rounded-md border border-gray-200 bg-gray-50 p-4`}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <h4 className="font-semibold text-gray-950">{occupation.name}</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {occupation.description || "暂无职业介绍。"}
          </p>
        </div>
        <dl className="grid content-start gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500">信用评级范围</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {occupation.credit_min}-{occupation.credit_max}
              {occupation.credit_note ? `（${occupation.credit_note}）` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">本职技能点</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {occupationPoints}（{occupation.skill_points_formula}）
            </dd>
            {calculation?.calculation ? (
              <dd className="mt-1 text-xs text-emerald-700">
                {calculation.calculation}
              </dd>
            ) : null}
          </div>
        </dl>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-3">
        <h5 className="text-sm font-medium text-gray-800">本职技能要求</h5>
        <ul className="mt-2 grid list-disc gap-x-6 gap-y-1 pl-5 text-sm text-gray-700 md:grid-cols-2">
          {occupation.occupation_skills.map((skill, index) => (
            <li key={`${skill}-${index}`}>{skill}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
