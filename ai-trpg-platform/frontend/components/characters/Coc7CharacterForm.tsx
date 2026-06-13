"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  getErrorMessage,
  getInitialNumber,
  getInitialString,
  parseJsonObject,
  stringifyInitialJson,
  type InitialFormData,
} from "../../lib/characterForm";
import type { Coc7CharacterCreate } from "../../types/character";
import JsonTextarea from "./JsonTextarea";

const coc7Defaults: Coc7CharacterCreate = {
  name: "",
  occupation: "",
  age: 30,
  gender: "",
  residence: "",
  birthplace: "",
  background: "",
  str: 50,
  con: 50,
  siz: 50,
  dex: 50,
  app: 50,
  int: 50,
  pow: 50,
  edu: 50,
  luck: 50,
  hp: 10,
  mp: 10,
  san: 50,
  build: 0,
  damage_bonus: "0",
  move: 8,
  skills_json: {
    spot_hidden: 50,
    listen: 40,
    library_use: 40,
    dodge: 25,
  },
  equipment_json: {
    items: [],
    weapons: [],
    cash: "",
    assets: "",
  },
  backstory_json: {
    personal_description: "",
    ideology: "",
    significant_people: "",
    meaningful_locations: "",
    treasured_possessions: "",
    traits: "",
  },
  status_json: {
    conditions: [],
    wounds: [],
    temporary_insanity: false,
    indefinite_insanity: false,
  },
};

type Coc7JsonField =
  | "skills_json"
  | "equipment_json"
  | "backstory_json"
  | "status_json";
type Coc7NumberField =
  | "age"
  | "str"
  | "con"
  | "siz"
  | "dex"
  | "app"
  | "int"
  | "pow"
  | "edu"
  | "luck"
  | "hp"
  | "mp"
  | "san"
  | "build"
  | "move";
type Coc7TextField =
  | "name"
  | "occupation"
  | "gender"
  | "residence"
  | "birthplace"
  | "background"
  | "damage_bonus";
type Coc7FormState = Omit<Coc7CharacterCreate, Coc7JsonField> &
  Record<Coc7JsonField, string>;

type Coc7CharacterFormProps = {
  initialData?: InitialFormData<Coc7CharacterCreate>;
  submitLabel: string;
  onSubmit: (data: Coc7CharacterCreate) => Promise<void>;
};

const basicTextFields: Array<{
  name: Coc7TextField;
  label: string;
  required?: boolean;
}> = [
  { name: "name", label: "角色名", required: true },
  { name: "occupation", label: "职业" },
  { name: "gender", label: "性别" },
  { name: "residence", label: "居住地" },
  { name: "birthplace", label: "出生地" },
  { name: "background", label: "背景" },
];

const attributeFields: Array<{ name: Coc7NumberField; label: string }> = [
  { name: "str", label: "STR" },
  { name: "con", label: "CON" },
  { name: "siz", label: "SIZ" },
  { name: "dex", label: "DEX" },
  { name: "app", label: "APP" },
  { name: "int", label: "INT" },
  { name: "pow", label: "POW" },
  { name: "edu", label: "EDU" },
  { name: "luck", label: "Luck" },
];

const derivedNumberFields: Array<{ name: Coc7NumberField; label: string }> = [
  { name: "hp", label: "HP" },
  { name: "mp", label: "MP" },
  { name: "san", label: "SAN" },
  { name: "build", label: "Build" },
  { name: "move", label: "Move" },
];

const jsonFields: Array<{ name: Coc7JsonField; label: string }> = [
  { name: "skills_json", label: "技能 JSON" },
  { name: "equipment_json", label: "装备 JSON" },
  { name: "backstory_json", label: "背景 JSON" },
  { name: "status_json", label: "状态 JSON" },
];

function buildInitialState(
  initialData?: InitialFormData<Coc7CharacterCreate>,
): Coc7FormState {
  return {
    name: getInitialString(initialData, "name", coc7Defaults.name),
    occupation: getInitialString(
      initialData,
      "occupation",
      coc7Defaults.occupation,
    ),
    age: getInitialNumber(initialData, "age", coc7Defaults.age),
    gender: getInitialString(initialData, "gender", coc7Defaults.gender),
    residence: getInitialString(initialData, "residence", coc7Defaults.residence),
    birthplace: getInitialString(
      initialData,
      "birthplace",
      coc7Defaults.birthplace,
    ),
    background: getInitialString(initialData, "background", coc7Defaults.background),
    str: getInitialNumber(initialData, "str", coc7Defaults.str),
    con: getInitialNumber(initialData, "con", coc7Defaults.con),
    siz: getInitialNumber(initialData, "siz", coc7Defaults.siz),
    dex: getInitialNumber(initialData, "dex", coc7Defaults.dex),
    app: getInitialNumber(initialData, "app", coc7Defaults.app),
    int: getInitialNumber(initialData, "int", coc7Defaults.int),
    pow: getInitialNumber(initialData, "pow", coc7Defaults.pow),
    edu: getInitialNumber(initialData, "edu", coc7Defaults.edu),
    luck: getInitialNumber(initialData, "luck", coc7Defaults.luck),
    hp: getInitialNumber(initialData, "hp", coc7Defaults.hp),
    mp: getInitialNumber(initialData, "mp", coc7Defaults.mp),
    san: getInitialNumber(initialData, "san", coc7Defaults.san),
    build: getInitialNumber(initialData, "build", coc7Defaults.build),
    damage_bonus: getInitialString(
      initialData,
      "damage_bonus",
      coc7Defaults.damage_bonus,
    ),
    move: getInitialNumber(initialData, "move", coc7Defaults.move),
    skills_json: stringifyInitialJson(
      initialData,
      "skills_json",
      coc7Defaults.skills_json,
    ),
    equipment_json: stringifyInitialJson(
      initialData,
      "equipment_json",
      coc7Defaults.equipment_json,
    ),
    backstory_json: stringifyInitialJson(
      initialData,
      "backstory_json",
      coc7Defaults.backstory_json,
    ),
    status_json: stringifyInitialJson(
      initialData,
      "status_json",
      coc7Defaults.status_json,
    ),
  };
}

function buildPayload(state: Coc7FormState): Coc7CharacterCreate {
  return {
    name: state.name,
    occupation: state.occupation,
    age: state.age,
    gender: state.gender,
    residence: state.residence,
    birthplace: state.birthplace,
    background: state.background,
    str: state.str,
    con: state.con,
    siz: state.siz,
    dex: state.dex,
    app: state.app,
    int: state.int,
    pow: state.pow,
    edu: state.edu,
    luck: state.luck,
    hp: state.hp,
    mp: state.mp,
    san: state.san,
    build: state.build,
    damage_bonus: state.damage_bonus,
    move: state.move,
    skills_json: parseJsonObject("技能 JSON", state.skills_json),
    equipment_json: parseJsonObject("装备 JSON", state.equipment_json),
    backstory_json: parseJsonObject("背景 JSON", state.backstory_json),
    status_json: parseJsonObject("状态 JSON", state.status_json),
  };
}

export default function Coc7CharacterForm({
  initialData,
  submitLabel,
  onSubmit,
}: Coc7CharacterFormProps) {
  const [formState, setFormState] = useState<Coc7FormState>(() =>
    buildInitialState(initialData),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (name: Coc7TextField, value: string) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleNumberChange = (name: Coc7NumberField, value: string) => {
    const nextValue = Number(value);
    setFormState((current) => ({
      ...current,
      [name]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  };

  const handleJsonChange = (name: string, value: string) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(buildPayload(formState));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section>
        <h2 className="text-lg font-semibold text-gray-950">基础信息</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {basicTextFields.map((field) => (
            <label key={field.name} className="block">
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                disabled={isSubmitting}
                required={field.required}
                type="text"
                value={formState[field.name]}
                onChange={(event) =>
                  handleTextChange(field.name, event.target.value)
                }
              />
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">年龄</span>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={isSubmitting}
              min={0}
              type="number"
              value={formState.age}
              onChange={(event) => handleNumberChange("age", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-950">属性</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {attributeFields.map((field) => (
            <label key={field.name} className="block">
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                disabled={isSubmitting}
                type="number"
                value={formState[field.name]}
                onChange={(event) =>
                  handleNumberChange(field.name, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-950">衍生属性</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {derivedNumberFields.map((field) => (
            <label key={field.name} className="block">
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                disabled={isSubmitting}
                type="number"
                value={formState[field.name]}
                onChange={(event) =>
                  handleNumberChange(field.name, event.target.value)
                }
              />
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Damage Bonus</span>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={isSubmitting}
              type="text"
              value={formState.damage_bonus}
              onChange={(event) =>
                handleTextChange("damage_bonus", event.target.value)
              }
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-950">JSON 字段</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {jsonFields.map((field) => (
            <JsonTextarea
              key={field.name}
              disabled={isSubmitting}
              label={field.label}
              name={field.name}
              value={formState[field.name]}
              onChange={handleJsonChange}
            />
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}
