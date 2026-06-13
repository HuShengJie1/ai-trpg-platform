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
import type { Dnd5eCharacterCreate } from "../../types/character";
import JsonTextarea from "./JsonTextarea";

const dnd5eDefaults: Dnd5eCharacterCreate = {
  name: "",
  race: "",
  class_name: "",
  subclass: "",
  level: 1,
  background: "",
  alignment: "",
  player_name: "",
  experience_points: 0,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  armor_class: 10,
  initiative: 0,
  speed: 30,
  max_hp: 8,
  current_hp: 8,
  temporary_hp: 0,
  hit_dice: "1d8",
  proficiencies_json: {
    armor: [],
    weapons: [],
    tools: [],
    languages: [],
    saving_throws: [],
    skills: [],
  },
  skills_json: {
    acrobatics: 0,
    animal_handling: 0,
    arcana: 0,
    athletics: 0,
    deception: 0,
    history: 0,
    insight: 0,
    intimidation: 0,
    investigation: 0,
    medicine: 0,
    nature: 0,
    perception: 0,
    performance: 0,
    persuasion: 0,
    religion: 0,
    sleight_of_hand: 0,
    stealth: 0,
    survival: 0,
  },
  equipment_json: {
    items: [],
    weapons: [],
    armor: [],
    currency: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
    },
  },
  spellcasting_json: {
    spellcasting_class: "",
    spellcasting_ability: "",
    spell_save_dc: 0,
    spell_attack_bonus: 0,
    cantrips: [],
    spells: [],
    spell_slots: {},
  },
  features_json: {
    racial_traits: [],
    class_features: [],
    feats: [],
    other_traits: [],
  },
  status_json: {
    conditions: [],
    exhaustion: 0,
    inspiration: false,
  },
};

type Dnd5eJsonField =
  | "proficiencies_json"
  | "skills_json"
  | "equipment_json"
  | "spellcasting_json"
  | "features_json"
  | "status_json";
type Dnd5eNumberField =
  | "level"
  | "experience_points"
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma"
  | "armor_class"
  | "initiative"
  | "speed"
  | "max_hp"
  | "current_hp"
  | "temporary_hp";
type Dnd5eTextField =
  | "name"
  | "race"
  | "class_name"
  | "subclass"
  | "background"
  | "alignment"
  | "player_name"
  | "hit_dice";
type Dnd5eFormState = Omit<Dnd5eCharacterCreate, Dnd5eJsonField> &
  Record<Dnd5eJsonField, string>;

type Dnd5eCharacterFormProps = {
  initialData?: InitialFormData<Dnd5eCharacterCreate>;
  submitLabel: string;
  onSubmit: (data: Dnd5eCharacterCreate) => Promise<void>;
};

const basicTextFields: Array<{
  name: Dnd5eTextField;
  label: string;
  required?: boolean;
}> = [
  { name: "name", label: "角色名", required: true },
  { name: "race", label: "种族" },
  { name: "class_name", label: "职业" },
  { name: "subclass", label: "子职业" },
  { name: "background", label: "背景" },
  { name: "alignment", label: "阵营" },
  { name: "player_name", label: "玩家名" },
];

const abilityFields: Array<{ name: Dnd5eNumberField; label: string }> = [
  { name: "strength", label: "Strength" },
  { name: "dexterity", label: "Dexterity" },
  { name: "constitution", label: "Constitution" },
  { name: "intelligence", label: "Intelligence" },
  { name: "wisdom", label: "Wisdom" },
  { name: "charisma", label: "Charisma" },
];

const combatNumberFields: Array<{ name: Dnd5eNumberField; label: string }> = [
  { name: "armor_class", label: "AC" },
  { name: "initiative", label: "先攻" },
  { name: "speed", label: "速度" },
  { name: "max_hp", label: "最大 HP" },
  { name: "current_hp", label: "当前 HP" },
  { name: "temporary_hp", label: "临时 HP" },
];

const jsonFields: Array<{ name: Dnd5eJsonField; label: string }> = [
  { name: "proficiencies_json", label: "熟练项 JSON" },
  { name: "skills_json", label: "技能 JSON" },
  { name: "equipment_json", label: "装备 JSON" },
  { name: "spellcasting_json", label: "法术 JSON" },
  { name: "features_json", label: "特性 JSON" },
  { name: "status_json", label: "状态 JSON" },
];

function buildInitialState(
  initialData?: InitialFormData<Dnd5eCharacterCreate>,
): Dnd5eFormState {
  return {
    name: getInitialString(initialData, "name", dnd5eDefaults.name),
    race: getInitialString(initialData, "race", dnd5eDefaults.race),
    class_name: getInitialString(
      initialData,
      "class_name",
      dnd5eDefaults.class_name,
    ),
    subclass: getInitialString(initialData, "subclass", dnd5eDefaults.subclass),
    level: getInitialNumber(initialData, "level", dnd5eDefaults.level),
    background: getInitialString(
      initialData,
      "background",
      dnd5eDefaults.background,
    ),
    alignment: getInitialString(initialData, "alignment", dnd5eDefaults.alignment),
    player_name: getInitialString(
      initialData,
      "player_name",
      dnd5eDefaults.player_name,
    ),
    experience_points: getInitialNumber(
      initialData,
      "experience_points",
      dnd5eDefaults.experience_points,
    ),
    strength: getInitialNumber(initialData, "strength", dnd5eDefaults.strength),
    dexterity: getInitialNumber(initialData, "dexterity", dnd5eDefaults.dexterity),
    constitution: getInitialNumber(
      initialData,
      "constitution",
      dnd5eDefaults.constitution,
    ),
    intelligence: getInitialNumber(
      initialData,
      "intelligence",
      dnd5eDefaults.intelligence,
    ),
    wisdom: getInitialNumber(initialData, "wisdom", dnd5eDefaults.wisdom),
    charisma: getInitialNumber(initialData, "charisma", dnd5eDefaults.charisma),
    armor_class: getInitialNumber(
      initialData,
      "armor_class",
      dnd5eDefaults.armor_class,
    ),
    initiative: getInitialNumber(
      initialData,
      "initiative",
      dnd5eDefaults.initiative,
    ),
    speed: getInitialNumber(initialData, "speed", dnd5eDefaults.speed),
    max_hp: getInitialNumber(initialData, "max_hp", dnd5eDefaults.max_hp),
    current_hp: getInitialNumber(
      initialData,
      "current_hp",
      dnd5eDefaults.current_hp,
    ),
    temporary_hp: getInitialNumber(
      initialData,
      "temporary_hp",
      dnd5eDefaults.temporary_hp,
    ),
    hit_dice: getInitialString(initialData, "hit_dice", dnd5eDefaults.hit_dice),
    proficiencies_json: stringifyInitialJson(
      initialData,
      "proficiencies_json",
      dnd5eDefaults.proficiencies_json,
    ),
    skills_json: stringifyInitialJson(
      initialData,
      "skills_json",
      dnd5eDefaults.skills_json,
    ),
    equipment_json: stringifyInitialJson(
      initialData,
      "equipment_json",
      dnd5eDefaults.equipment_json,
    ),
    spellcasting_json: stringifyInitialJson(
      initialData,
      "spellcasting_json",
      dnd5eDefaults.spellcasting_json,
    ),
    features_json: stringifyInitialJson(
      initialData,
      "features_json",
      dnd5eDefaults.features_json,
    ),
    status_json: stringifyInitialJson(
      initialData,
      "status_json",
      dnd5eDefaults.status_json,
    ),
  };
}

function buildPayload(state: Dnd5eFormState): Dnd5eCharacterCreate {
  return {
    name: state.name,
    race: state.race,
    class_name: state.class_name,
    subclass: state.subclass,
    level: state.level,
    background: state.background,
    alignment: state.alignment,
    player_name: state.player_name,
    experience_points: state.experience_points,
    strength: state.strength,
    dexterity: state.dexterity,
    constitution: state.constitution,
    intelligence: state.intelligence,
    wisdom: state.wisdom,
    charisma: state.charisma,
    armor_class: state.armor_class,
    initiative: state.initiative,
    speed: state.speed,
    max_hp: state.max_hp,
    current_hp: state.current_hp,
    temporary_hp: state.temporary_hp,
    hit_dice: state.hit_dice,
    proficiencies_json: parseJsonObject("熟练项 JSON", state.proficiencies_json),
    skills_json: parseJsonObject("技能 JSON", state.skills_json),
    equipment_json: parseJsonObject("装备 JSON", state.equipment_json),
    spellcasting_json: parseJsonObject("法术 JSON", state.spellcasting_json),
    features_json: parseJsonObject("特性 JSON", state.features_json),
    status_json: parseJsonObject("状态 JSON", state.status_json),
  };
}

export default function Dnd5eCharacterForm({
  initialData,
  submitLabel,
  onSubmit,
}: Dnd5eCharacterFormProps) {
  const [formState, setFormState] = useState<Dnd5eFormState>(() =>
    buildInitialState(initialData),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (name: Dnd5eTextField, value: string) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleNumberChange = (name: Dnd5eNumberField, value: string) => {
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
            <span className="text-sm font-medium text-gray-700">等级</span>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={isSubmitting}
              min={1}
              type="number"
              value={formState.level}
              onChange={(event) => handleNumberChange("level", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">经验值</span>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={isSubmitting}
              min={0}
              type="number"
              value={formState.experience_points}
              onChange={(event) =>
                handleNumberChange("experience_points", event.target.value)
              }
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-950">六维属性</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {abilityFields.map((field) => (
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
        <h2 className="text-lg font-semibold text-gray-950">战斗字段</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {combatNumberFields.map((field) => (
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
            <span className="text-sm font-medium text-gray-700">Hit Dice</span>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={isSubmitting}
              type="text"
              value={formState.hit_dice}
              onChange={(event) =>
                handleTextChange("hit_dice", event.target.value)
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
