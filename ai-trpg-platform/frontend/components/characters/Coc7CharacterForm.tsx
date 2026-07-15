"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  getErrorMessage,
  getInitialNumber,
  getInitialString,
  type InitialFormData,
} from "../../lib/characterForm";
import {
  calculateCoc7OccupationPoints,
  coc7OccupationAttributeLabels,
  findFixedOccupationSkillKey,
  findFixedOccupationSkillKeys,
  getOccupationChoiceCount,
  isOccupationSkillRuleSatisfied,
} from "../../lib/coc7Occupations";
import {
  getCoc7SkillTotal,
  normalizeCoc7Skills,
  refreshCoc7SkillBases,
  type Coc7SkillDraft,
} from "../../lib/coc7Skills";
import { getCoc7Occupations } from "../../lib/characters";
import type {
  Coc7CharacterCreate,
  Coc7Occupation,
  Coc7OccupationPointCalculation,
  JsonRecord,
} from "../../types/character";
import Coc7OccupationSelect from "./Coc7OccupationSelect";
import Coc7SkillsEditor from "./Coc7SkillsEditor";
import styles from "./Coc7Theme.module.css";

const coc7Defaults: Coc7CharacterCreate = {
  name: "",
  occupation: "",
  occupation_id: null,
  occupation_skill_points: 0,
  personal_interest_points: 100,
  credit_rating: 0,
  age: 30,
  gender: "",
  residence: "",
  birthplace: "",
  background: "现代",
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
  max_hp: 10,
  mp: 10,
  san: 50,
  build: 0,
  damage_bonus: "0",
  move: 8,
  skills_json: {},
  equipment_json: {},
  backstory_json: {},
  status_json: {},
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
  | "max_hp"
  | "build";
type Coc7AttributeField = Extract<
  Coc7NumberField,
  "str" | "con" | "siz" | "dex" | "app" | "int" | "pow" | "edu" | "luck"
>;
type Coc7TextField =
  | "name"
  | "occupation"
  | "gender"
  | "residence"
  | "birthplace"
  | "background";

type WeaponDraft = {
  name: string;
  skill: string;
  value: number;
  damage: string;
  range: string;
  attacks: string;
  ammo: string;
  malfunction: string;
};

type Coc7FormState = Omit<
  Coc7CharacterCreate,
  Coc7JsonField | "personal_interest_points"
> & {
  skills: Coc7SkillDraft[];
  occupation_points: number;
  skill_limit: number;
  weapons: WeaponDraft[];
  equipment_text: string;
  cash: string;
  spending_level: string;
  assets: string;
  armor: string;
  magic_items: string;
  spells: string;
  personal_description: string;
  ideology: string;
  significant_people: string;
  meaningful_locations: string;
  treasured_possessions: string;
  traits: string;
  injuries_scars: string;
  phobias_manias: string;
  relationships: string;
  encounters: string;
  notes: string;
  conditions: string;
  wounds: string;
  major_wound: boolean;
  temporary_insanity: boolean;
  indefinite_insanity: boolean;
};

type Coc7CharacterFormProps = {
  initialData?: InitialFormData<Coc7CharacterCreate>;
  submitLabel: string;
  onSubmit: (data: Coc7CharacterCreate) => Promise<void>;
};

const attributeFields: Array<{
  name: Coc7AttributeField;
  label: string;
  abbreviation: string;
  randomRangeMin: 2 | 3;
  randomRangeMax: 12 | 18;
  randomBonus: 0 | 5;
}> = [
  {
    name: "str",
    label: "力量",
    abbreviation: "STR",
    randomRangeMin: 3,
    randomRangeMax: 18,
    randomBonus: 0,
  },
  {
    name: "con",
    label: "体质",
    abbreviation: "CON",
    randomRangeMin: 3,
    randomRangeMax: 18,
    randomBonus: 0,
  },
  {
    name: "siz",
    label: "体型",
    abbreviation: "SIZ",
    randomRangeMin: 2,
    randomRangeMax: 12,
    randomBonus: 5,
  },
  {
    name: "dex",
    label: "敏捷",
    abbreviation: "DEX",
    randomRangeMin: 3,
    randomRangeMax: 18,
    randomBonus: 0,
  },
  {
    name: "app",
    label: "外貌",
    abbreviation: "APP",
    randomRangeMin: 3,
    randomRangeMax: 18,
    randomBonus: 0,
  },
  {
    name: "int",
    label: "智力",
    abbreviation: "INT",
    randomRangeMin: 2,
    randomRangeMax: 12,
    randomBonus: 5,
  },
  {
    name: "pow",
    label: "意志",
    abbreviation: "POW",
    randomRangeMin: 3,
    randomRangeMax: 18,
    randomBonus: 0,
  },
  {
    name: "edu",
    label: "教育",
    abbreviation: "EDU",
    randomRangeMin: 2,
    randomRangeMax: 12,
    randomBonus: 5,
  },
  {
    name: "luck",
    label: "幸运",
    abbreviation: "LUC",
    randomRangeMin: 3,
    randomRangeMax: 18,
    randomBonus: 0,
  },
];

const emptyWeapon: WeaponDraft = {
  name: "",
  skill: "",
  value: 0,
  damage: "",
  range: "",
  attacks: "",
  ammo: "",
  malfunction: "",
};

function asRecord(value: unknown): JsonRecord {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return asRecord(parsed);
    } catch {
      return {};
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  return {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asNumber(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join("\n");
  }

  return asString(value);
}

function getInitialJsonRecord<T>(
  data: InitialFormData<T> | undefined,
  key: keyof T,
): JsonRecord {
  return asRecord(data?.[key]);
}

function getHalf(value: number): number {
  return Math.floor(value / 2);
}

function getFifth(value: number): number {
  return Math.floor(value / 5);
}

function getMaxHp(con: number, siz: number): number {
  return Math.floor((con + siz) / 10);
}

function getMagicPoints(intelligence: number): number {
  return Math.floor(intelligence / 5);
}

function getPersonalInterestPoints(intelligence: number): number {
  return Math.max(0, intelligence) * 2;
}

function getBuildAndDamageBonus(
  str: number,
  siz: number,
): { build: number; damageBonus: string } {
  const total = str + siz;

  if (total <= 64) {
    return { build: -2, damageBonus: "-2" };
  }

  if (total <= 84) {
    return { build: -1, damageBonus: "-1" };
  }

  if (total <= 124) {
    return { build: 0, damageBonus: "0" };
  }

  if (total <= 164) {
    return { build: 1, damageBonus: "+1d4" };
  }

  if (total <= 204) {
    return { build: 2, damageBonus: "+1d6" };
  }

  if (total <= 284) {
    return { build: 3, damageBonus: "+2d6" };
  }

  if (total <= 364) {
    return { build: 4, damageBonus: "+3d6" };
  }

  if (total <= 444) {
    return { build: 5, damageBonus: "+4d6" };
  }

  return { build: 6, damageBonus: "+5d6" };
}

function getMoveRate(
  str: number,
  dex: number,
  siz: number,
  age: number,
): number {
  let move = 8;

  if (str < siz && dex < siz) {
    move = 7;
  } else if (str > siz && dex > siz) {
    move = 9;
  }

  if (age >= 80 && age <= 89) {
    return move - 5;
  }

  if (age >= 70 && age <= 79) {
    return move - 4;
  }

  if (age >= 60 && age <= 69) {
    return move - 3;
  }

  if (age >= 50 && age <= 59) {
    return move - 2;
  }

  if (age >= 40 && age <= 49) {
    return move - 1;
  }

  return move;
}

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAttributeValue(name: Coc7AttributeField): number {
  const field = attributeFields.find((item) => item.name === name);

  if (!field) {
    return 0;
  }

  return (
    (getRandomInteger(field.randomRangeMin, field.randomRangeMax) +
      field.randomBonus) *
    5
  );
}

function getRandomAttributes(): Record<Coc7AttributeField, number> {
  return attributeFields.reduce(
    (attributes, field) => ({
      ...attributes,
      [field.name]: getRandomAttributeValue(field.name),
    }),
    {} as Record<Coc7AttributeField, number>,
  );
}

function getWeaponList(equipmentJson: JsonRecord): WeaponDraft[] {
  const weapons = asArray(equipmentJson.weapons)
    .slice(0, 4)
    .map((item) => {
      const record = asRecord(item);
      return {
        name: asString(record.name),
        skill: asString(record.skill),
        value: asNumber(record.value),
        damage: asString(record.damage),
        range: asString(record.range),
        attacks: asString(record.attacks),
        ammo: asString(record.ammo),
        malfunction: asString(record.malfunction),
      };
    });

  return [...weapons, ...Array.from({ length: 4 - weapons.length }, () => ({ ...emptyWeapon }))];
}

function buildInitialState(
  initialData?: InitialFormData<Coc7CharacterCreate>,
): Coc7FormState {
  const skillsJson = getInitialJsonRecord(initialData, "skills_json");
  const equipmentJson = getInitialJsonRecord(initialData, "equipment_json");
  const backstoryJson = getInitialJsonRecord(initialData, "backstory_json");
  const statusJson = getInitialJsonRecord(initialData, "status_json");
  const initialCon = getInitialNumber(initialData, "con", coc7Defaults.con);
  const initialSiz = getInitialNumber(initialData, "siz", coc7Defaults.siz);
  const initialStr = getInitialNumber(initialData, "str", coc7Defaults.str);
  const initialDex = getInitialNumber(initialData, "dex", coc7Defaults.dex);
  const initialInt = getInitialNumber(initialData, "int", coc7Defaults.int);
  const initialPow = getInitialNumber(initialData, "pow", coc7Defaults.pow);
  const initialEdu = getInitialNumber(initialData, "edu", coc7Defaults.edu);
  const initialAge = getInitialNumber(initialData, "age", coc7Defaults.age);
  const initialCreditRating = getInitialNumber(
    initialData,
    "credit_rating",
    coc7Defaults.credit_rating,
  );
  const initialMaxHp = getMaxHp(initialCon, initialSiz);
  const initialHp = getInitialNumber(initialData, "hp", coc7Defaults.hp);
  const initialBuild = getBuildAndDamageBonus(initialStr, initialSiz);
  const initialMove = getMoveRate(
    initialStr,
    initialDex,
    initialSiz,
    initialAge,
  );

  const initialSkills = normalizeCoc7Skills(skillsJson, initialEdu, initialDex).map(
    (skill) =>
      skill.key === "credit_rating" &&
      getCoc7SkillTotal(skill) === 0 &&
      initialCreditRating > 0
        ? { ...skill, occupation: initialCreditRating }
        : skill,
  );
  const occupationId = getInitialNumber(initialData, "occupation_id", 0);

  return {
    name: getInitialString(initialData, "name", coc7Defaults.name),
    occupation_id: occupationId > 0 ? occupationId : null,
    occupation_skill_points: getInitialNumber(
      initialData,
      "occupation_skill_points",
      asNumber(skillsJson.occupation_points),
    ),
    credit_rating: initialCreditRating,
    occupation: getInitialString(
      initialData,
      "occupation",
      coc7Defaults.occupation ?? "",
    ),
    age: initialAge,
    gender: getInitialString(initialData, "gender", coc7Defaults.gender),
    residence: getInitialString(initialData, "residence", coc7Defaults.residence),
    birthplace: getInitialString(
      initialData,
      "birthplace",
      coc7Defaults.birthplace,
    ),
    background: getInitialString(initialData, "background", coc7Defaults.background),
    str: initialStr,
    con: initialCon,
    siz: initialSiz,
    dex: initialDex,
    app: getInitialNumber(initialData, "app", coc7Defaults.app),
    int: initialInt,
    pow: initialPow,
    edu: initialEdu,
    luck: getInitialNumber(initialData, "luck", coc7Defaults.luck),
    hp: Math.min(Math.max(initialHp, 0), initialMaxHp),
    max_hp: initialMaxHp,
    mp: getMagicPoints(initialInt),
    san: initialPow,
    build: initialBuild.build,
    damage_bonus: initialBuild.damageBonus,
    move: initialMove,
    skills: initialSkills,
    occupation_points: getInitialNumber(
      initialData,
      "occupation_skill_points",
      asNumber(skillsJson.occupation_points),
    ),
    skill_limit: asNumber(skillsJson.skill_limit),
    weapons: getWeaponList(equipmentJson),
    equipment_text: arrayToLines(equipmentJson.items),
    cash: asString(equipmentJson.cash),
    spending_level: asString(equipmentJson.spending_level),
    assets: asString(equipmentJson.assets),
    armor: asString(equipmentJson.armor),
    magic_items: asString(equipmentJson.magic_items),
    spells: arrayToLines(equipmentJson.spells),
    personal_description: asString(backstoryJson.personal_description),
    ideology: asString(backstoryJson.ideology),
    significant_people: asString(backstoryJson.significant_people),
    meaningful_locations: asString(backstoryJson.meaningful_locations),
    treasured_possessions: asString(backstoryJson.treasured_possessions),
    traits: asString(backstoryJson.traits),
    injuries_scars: asString(backstoryJson.injuries_scars),
    phobias_manias: asString(backstoryJson.phobias_manias),
    relationships: arrayToLines(backstoryJson.relationships),
    encounters: asString(backstoryJson.encounters),
    notes: asString(backstoryJson.notes),
    conditions: arrayToLines(statusJson.conditions),
    wounds: arrayToLines(statusJson.wounds),
    major_wound: asBoolean(statusJson.major_wound),
    temporary_insanity: asBoolean(statusJson.temporary_insanity),
    indefinite_insanity: asBoolean(statusJson.indefinite_insanity),
  };
}

function buildPayload(
  state: Coc7FormState,
  pointCalculation: Coc7OccupationPointCalculation | null,
): Coc7CharacterCreate {
  const occupationPoints = pointCalculation?.total ?? state.occupation_points;
  const personalInterestPoints = getPersonalInterestPoints(state.int);
  const creditRating = getCoc7SkillTotal(
    state.skills.find((skill) => skill.key === "credit_rating") ?? {
      key: "credit_rating",
      label: "信用评级",
      name: "信用评级",
      category: "调查与感知",
      kind: "fixed",
      baseRule: "fixed",
      base: 0,
      occupation: 0,
      interest: 0,
      growth: 0,
      checked: false,
      isOccupation: false,
      specialization: "",
      options: [],
    },
  );

  return {
    name: state.name,
    ...(state.occupation_id ? {} : { occupation: state.occupation }),
    occupation_id: state.occupation_id,
    occupation_skill_points: occupationPoints,
    personal_interest_points: personalInterestPoints,
    credit_rating: creditRating,
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
    max_hp: state.max_hp,
    mp: state.mp,
    san: state.san,
    build: state.build,
    damage_bonus: state.damage_bonus,
    move: state.move,
    skills_json: {
      occupation_points: occupationPoints,
      interest_points: personalInterestPoints,
      skill_limit: state.skill_limit,
      skills: state.skills.map((skill) => {
        const total = getCoc7SkillTotal(skill);

        return {
          key: skill.key,
          label: skill.label,
          name: skill.name || skill.label,
          category: skill.category,
          kind: skill.kind,
          base_rule: skill.baseRule,
          specialization: skill.specialization,
          base: skill.base,
          occupation: skill.occupation,
          interest: skill.interest,
          growth: skill.growth,
          checked: skill.checked,
          is_occupation: skill.isOccupation,
          total,
          half: getHalf(total),
          fifth: getFifth(total),
        };
      }),
    },
    equipment_json: {
      items: linesToArray(state.equipment_text),
      weapons: state.weapons.filter((weapon) => weapon.name.trim()),
      cash: state.cash,
      spending_level: state.spending_level,
      assets: state.assets,
      armor: state.armor,
      magic_items: state.magic_items,
      spells: linesToArray(state.spells),
    },
    backstory_json: {
      personal_description: state.personal_description,
      ideology: state.ideology,
      significant_people: state.significant_people,
      meaningful_locations: state.meaningful_locations,
      treasured_possessions: state.treasured_possessions,
      traits: state.traits,
      injuries_scars: state.injuries_scars,
      phobias_manias: state.phobias_manias,
      relationships: linesToArray(state.relationships),
      encounters: state.encounters,
      notes: state.notes,
    },
    status_json: {
      conditions: linesToArray(state.conditions),
      wounds: linesToArray(state.wounds),
      major_wound: state.major_wound,
      temporary_insanity: state.temporary_insanity,
      indefinite_insanity: state.indefinite_insanity,
    },
  };
}

function Section({
  children,
  className = "",
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
}) {
  return (
    <section
      className={`${styles.formSection} ${className} rounded-lg border border-stone-300 bg-stone-50 p-4 shadow-sm`}
    >
      <div
        className={`${styles.sectionHeading} border-b border-stone-300 pb-3`}
      >
        <h2 className="text-lg font-semibold tracking-normal text-stone-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextInput({
  disabled,
  label,
  value,
  onChange,
  required = false,
}: {
  disabled: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        disabled={disabled}
        required={required}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberInput({
  disabled,
  label,
  value,
  onChange,
  min,
  max,
}: {
  disabled: boolean;
  label: string;
  value: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        disabled={disabled}
        max={max}
        min={min}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ReadonlyNumberInput({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-950"
        readOnly
        type="number"
        value={value}
      />
    </label>
  );
}

function ReadonlyTextInput({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-950"
        readOnly
        type="text"
        value={value}
      />
    </label>
  );
}

function TextAreaInput({
  disabled,
  label,
  value,
  onChange,
  rows = 4,
}: {
  disabled: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <textarea
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm leading-6 text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
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
  const [occupations, setOccupations] = useState<Coc7Occupation[]>([]);
  const [occupationStatus, setOccupationStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [occupationError, setOccupationError] = useState<string | null>(null);
  const [occupationReloadKey, setOccupationReloadKey] = useState(0);
  const [pendingOccupation, setPendingOccupation] =
    useState<Coc7Occupation | null>(null);

  useEffect(() => {
    let isCurrent = true;
    setOccupationStatus("loading");
    setOccupationError(null);
    getCoc7Occupations()
      .then((items) => {
        if (!isCurrent) return;
        setOccupations(items);
        setOccupationStatus("ready");
      })
      .catch((caughtError) => {
        if (!isCurrent) return;
        setOccupationError(
          getErrorMessage(caughtError, "无法读取职业目录。"),
        );
        setOccupationStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [occupationReloadKey]);

  const selectedOccupation = useMemo(
    () =>
      occupations.find(
        (occupation) => occupation.id === formState.occupation_id,
      ) ?? null,
    [formState.occupation_id, occupations],
  );
  const occupationPointCalculation = useMemo(
    () =>
      selectedOccupation
        ? calculateCoc7OccupationPoints(selectedOccupation, {
            str: formState.str,
            dex: formState.dex,
            app: formState.app,
            pow: formState.pow,
            edu: formState.edu,
          })
        : null,
    [
      formState.app,
      formState.dex,
      formState.edu,
      formState.pow,
      formState.str,
      selectedOccupation,
    ],
  );
  const creditSkill = formState.skills.find(
    (skill) => skill.key === "credit_rating",
  );
  const creditRating = creditSkill ? getCoc7SkillTotal(creditSkill) : 0;
  const creditRangeError =
    selectedOccupation &&
    (creditRating < selectedOccupation.credit_min ||
      creditRating > selectedOccupation.credit_max)
      ? `信用评级必须在当前职业要求的 ${selectedOccupation.credit_min}-${selectedOccupation.credit_max} 范围内。`
      : null;
  const occupationRuleProgress = useMemo(() => {
    if (!selectedOccupation) {
      return { fixedKeys: new Set<string>(), required: 0, selected: 0 };
    }
    const fixedKeys = findFixedOccupationSkillKeys(
      selectedOccupation.occupation_skills,
      formState.skills,
    );
    const required = selectedOccupation.occupation_skills.reduce(
      (total, rule) =>
        findFixedOccupationSkillKey(rule, formState.skills)
          ? total
          : total + getOccupationChoiceCount(rule),
      0,
    );
    const selected = formState.skills.filter(
      (skill) => skill.isOccupation && !fixedKeys.has(skill.key),
    ).length;
    return { fixedKeys, required, selected };
  }, [formState.skills, selectedOccupation]);

  const applyOccupation = (occupation: Coc7Occupation) => {
    setFormState((current) => {
      const fixedSkillKeys = findFixedOccupationSkillKeys(
        occupation.occupation_skills,
        current.skills,
      );
      return {
        ...current,
        occupation_id: occupation.id,
        occupation: occupation.name,
        skills: current.skills.map((skill) => ({
          ...skill,
          isOccupation: fixedSkillKeys.has(skill.key),
        })),
      };
    });
    setPendingOccupation(null);
    setError(null);
  };

  const requestOccupationChange = (occupation: Coc7Occupation) => {
    if (occupation.id === formState.occupation_id) return;
    const hasOccupationWork = formState.skills.some(
      (skill) => skill.isOccupation || skill.occupation > 0,
    );
    if (formState.occupation_id && hasOccupationWork) {
      setPendingOccupation(occupation);
      return;
    }
    applyOccupation(occupation);
  };

  const handleTextChange = (name: Coc7TextField, value: string) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleNumberChange = (name: Coc7NumberField, value: string) => {
    const nextValue = Number(value);
    const normalizedValue = Number.isFinite(nextValue) ? nextValue : 0;

    setFormState((current) => {
      const fieldValue =
        name === "hp"
          ? Math.min(Math.max(normalizedValue, 0), current.max_hp)
          : normalizedValue;
      const nextState = {
        ...current,
        [name]: fieldValue,
      };

      if (name === "con" || name === "siz") {
        nextState.max_hp = getMaxHp(nextState.con, nextState.siz);
        nextState.hp = Math.min(nextState.hp, nextState.max_hp);
      }

      if (name === "str" || name === "siz") {
        const derived = getBuildAndDamageBonus(nextState.str, nextState.siz);
        nextState.build = derived.build;
        nextState.damage_bonus = derived.damageBonus;
      }

      if (name === "int") {
        nextState.mp = getMagicPoints(nextState.int);
      }

      if (name === "pow") {
        nextState.san = nextState.pow;
      }

      if (name === "edu" || name === "dex") {
        nextState.skills = refreshCoc7SkillBases(
          nextState.skills,
          nextState.edu,
          nextState.dex,
        );
      }

      if (
        name === "age" ||
        name === "str" ||
        name === "dex" ||
        name === "siz"
      ) {
        nextState.move = getMoveRate(
          nextState.str,
          nextState.dex,
          nextState.siz,
          nextState.age,
        );
      }

      return nextState;
    });
  };

  const randomizeAllAttributes = () => {
    const attributes = getRandomAttributes();
    const maxHp = getMaxHp(attributes.con, attributes.siz);
    const derived = getBuildAndDamageBonus(attributes.str, attributes.siz);

    setFormState((current) => ({
      ...current,
      ...attributes,
      hp: Math.min(current.hp, maxHp),
      max_hp: maxHp,
      mp: getMagicPoints(attributes.int),
      san: attributes.pow,
      skills: refreshCoc7SkillBases(
        current.skills,
        attributes.edu,
        attributes.dex,
      ),
      build: derived.build,
      damage_bonus: derived.damageBonus,
      move: getMoveRate(
        attributes.str,
        attributes.dex,
        attributes.siz,
        current.age,
      ),
    }));
  };

  const updateSkill = (index: number, nextSkill: Coc7SkillDraft) => {
    setFormState((current) => ({
      ...current,
      skills: current.skills.map((skill, skillIndex) =>
        skillIndex === index ? nextSkill : skill,
      ),
    }));
  };

  const updateWeapon = (
    index: number,
    key: keyof WeaponDraft,
    value: string,
  ) => {
    setFormState((current) => ({
      ...current,
      weapons: current.weapons.map((weapon, weaponIndex) =>
        weaponIndex === index
          ? {
              ...weapon,
              [key]: key === "value" ? asNumber(value) : value,
            }
          : weapon,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (creditRangeError) {
      setError(creditRangeError);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(buildPayload(formState, occupationPointCalculation));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={`${styles.form} space-y-6 text-stone-950`}
      onSubmit={handleSubmit}
    >
      <div className={styles.formLead}>
        <div className={styles.formLeadColumn}>
          <div
            className={`${styles.masthead} rounded-lg border border-stone-800 bg-stone-950 p-5 text-stone-100 shadow-sm`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm text-emerald-300">克苏鲁的呼唤第七版</p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal">
                  调查员档案
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <NumberInput
                  disabled={isSubmitting}
                  label="当前生命值"
                  value={formState.hp}
                  onChange={(value) => handleNumberChange("hp", value)}
                  min={0}
                  max={formState.max_hp}
                />
                <ReadonlyNumberInput
                  label="最大生命值"
                  value={formState.max_hp}
                />
                <ReadonlyNumberInput
                  label="魔法值"
                  value={formState.mp}
                />
                <ReadonlyNumberInput
                  label="理智值"
                  value={formState.san}
                />
              </div>
            </div>
          </div>

          <Section
            className={styles.basicSection}
            title="基础资料"
            description="记录调查员的身份、年代和出身信息。"
          >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TextInput
            disabled={isSubmitting}
            label="姓名"
            required
            value={formState.name}
            onChange={(value) => handleTextChange("name", value)}
          />
          <Coc7OccupationSelect
            disabled={isSubmitting}
            error={occupationError}
            legacyName={formState.occupation ?? ""}
            occupations={occupations}
            selected={selectedOccupation}
            status={occupationStatus}
            onRetry={() => setOccupationReloadKey((current) => current + 1)}
            onSelect={requestOccupationChange}
          />
          <NumberInput
            disabled={isSubmitting}
            label="年龄"
            value={formState.age}
            onChange={(value) => handleNumberChange("age", value)}
            min={0}
          />
          <TextInput
            disabled={isSubmitting}
            label="性别"
            value={formState.gender}
            onChange={(value) => handleTextChange("gender", value)}
          />
          <TextInput
            disabled={isSubmitting}
            label="现居地"
            value={formState.residence}
            onChange={(value) => handleTextChange("residence", value)}
          />
          <TextInput
            disabled={isSubmitting}
            label="出生地"
            value={formState.birthplace}
            onChange={(value) => handleTextChange("birthplace", value)}
          />
          <TextInput
            disabled={isSubmitting}
            label="背景年代"
            value={formState.background}
            onChange={(value) => handleTextChange("background", value)}
          />
        </div>

        {formState.occupation_id &&
        occupationStatus === "ready" &&
        !selectedOccupation ? (
          <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            当前角色关联的职业已不存在，请重新选择职业。
          </p>
        ) : null}

        {pendingOccupation ? (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p>
              切换到“{pendingOccupation.name}”会重新整理本职技能标记，但不会清空已经投入的职业点数。
            </p>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded-md bg-amber-800 px-3 py-1.5 font-medium text-white hover:bg-amber-900"
                type="button"
                onClick={() => applyOccupation(pendingOccupation)}
              >
                确认切换
              </button>
              <button
                className="rounded-md border border-amber-400 bg-white px-3 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
                type="button"
                onClick={() => setPendingOccupation(null)}
              >
                取消
              </button>
            </div>
          </div>
        ) : null}

        {selectedOccupation ? (
          <div
            className={`${styles.occupationOverview} mt-4 rounded-md border border-stone-300 bg-white p-4`}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-semibold text-stone-950">
                    {selectedOccupation.name}
                  </h3>
                  <span className="text-sm text-stone-600">
                    信用评级 {selectedOccupation.credit_min}-
                    {selectedOccupation.credit_max}
                    {selectedOccupation.credit_note
                      ? `（${selectedOccupation.credit_note}）`
                      : ""}
                  </span>
                </div>
                <p
                  className={`${styles.occupationDescription} mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700`}
                >
                  {selectedOccupation.description || "暂无职业介绍。"}
                </p>
              </div>
              <div
                className={`${styles.occupationFormula} rounded-md bg-stone-100 p-3 text-sm`}
              >
                <p className="text-stone-500">本职技能点公式</p>
                <p className="mt-1 font-medium text-stone-950">
                  {selectedOccupation.skill_points_formula}
                </p>
                {occupationPointCalculation ? (
                  <p className="mt-2 text-emerald-800">
                    {occupationPointCalculation.calculation}
                  </p>
                ) : null}
                {occupationPointCalculation?.selected_attribute ? (
                  <p className="mt-1 text-xs text-stone-600">
                    已在
                    {occupationPointCalculation.selected_from
                      .map(
                        (attribute) =>
                          `${coc7OccupationAttributeLabels[attribute]} ${formState[attribute]}`,
                      )
                      .join("、")}
                    中选择
                    {coc7OccupationAttributeLabels[
                      occupationPointCalculation.selected_attribute
                    ]}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
          </Section>
        </div>

        <div className={styles.formLeadColumn}>

          <Section
            className={styles.attributeSection}
            title="属性"
            description="属性值可以手动填写，也可以按规则随机生成；下方自动展示半值与五分之一值，方便之后进行难度判定。"
          >
        <div className="mb-4 flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-stone-600">
            随机生成会直接写入换算后的最终属性值；体型、智力、教育使用
            2-12 后 +5，再 ×5，其余属性使用 3-18 后 ×5。
          </p>
          <button
            className={`${styles.secondaryAction} shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400`}
            disabled={isSubmitting}
            type="button"
            onClick={randomizeAllAttributes}
          >
            随机生成全部属性
          </button>
        </div>
        <div className={styles.attributeTableHeader} aria-hidden="true">
          <span>属性</span>
          <span>属性值</span>
          <span>半值（向下取整）</span>
          <span>五分之一（向下取整）</span>
        </div>
        <div
          className={`${styles.attributeTable} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}
        >
          {attributeFields.map((field) => {
            const value = formState[field.name];

            return (
              <div
                key={field.name}
                className={`${styles.attributeCard} rounded-md border border-stone-300 bg-white p-3`}
              >
                <div
                  className={`${styles.attributeIdentity} flex items-start justify-between gap-3`}
                >
                  <div className={styles.attributeName}>
                    <p className="text-sm font-medium text-stone-900">
                      {field.label}
                    </p>
                    <p className="text-xs text-stone-500">{field.abbreviation}</p>
                  </div>
                  <input
                    aria-label={`${field.label}（${field.abbreviation}）`}
                    className={`${styles.attributeInput} h-12 w-24 rounded-md border border-stone-300 bg-stone-50 px-3 text-center text-xl font-semibold text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100`}
                    disabled={isSubmitting}
                    type="number"
                    value={value}
                    onChange={(event) =>
                      handleNumberChange(field.name, event.target.value)
                    }
                  />
                </div>
                <div
                  className={`${styles.attributeMetrics} mt-3 grid grid-cols-2 gap-2 text-center text-xs`}
                >
                  <div
                    className={`${styles.metricCell} rounded bg-stone-100 px-2 py-1`}
                  >
                    <span className="text-stone-500">半值</span>
                    <strong className="ml-2 text-stone-900">{getHalf(value)}</strong>
                  </div>
                  <div
                    className={`${styles.metricCell} rounded bg-stone-100 px-2 py-1`}
                  >
                    <span className="text-stone-500">五分之一</span>
                    <strong className="ml-2 text-stone-900">{getFifth(value)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          </Section>

          <Section className={styles.statusSection} title="战斗与状态基础值">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NumberInput
            disabled={isSubmitting}
            label="当前生命值"
            value={formState.hp}
            onChange={(value) => handleNumberChange("hp", value)}
            min={0}
            max={formState.max_hp}
          />
          <ReadonlyNumberInput
            label="最大生命值"
            value={formState.max_hp}
          />
          <ReadonlyNumberInput
            label="魔法值"
            value={formState.mp}
          />
          <ReadonlyNumberInput
            label="理智值"
            value={formState.san}
          />
          <ReadonlyTextInput
            label="伤害加值"
            value={formState.damage_bonus}
          />
          <ReadonlyNumberInput
            label="体格"
            value={formState.build}
          />
          <ReadonlyNumberInput
            label="移动率"
            value={formState.move}
          />
          <TextInput
            disabled={isSubmitting}
            label="护甲"
            value={formState.armor}
            onChange={(value) =>
              setFormState((current) => ({ ...current, armor: value }))
            }
          />
          <label className="flex items-center gap-2 pt-7 text-sm text-stone-700">
            <input
              checked={formState.major_wound}
              className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
              disabled={isSubmitting}
              type="checkbox"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  major_wound: event.target.checked,
                }))
              }
            />
            重伤
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm text-stone-700">
            <input
              checked={formState.temporary_insanity}
              className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
              disabled={isSubmitting}
              type="checkbox"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  temporary_insanity: event.target.checked,
                }))
              }
            />
            临时性疯狂
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm text-stone-700">
            <input
              checked={formState.indefinite_insanity}
              className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
              disabled={isSubmitting}
              type="checkbox"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  indefinite_insanity: event.target.checked,
                }))
              }
            />
            不定性疯狂
          </label>
        </div>
          </Section>
        </div>
      </div>

      <Section
        className={styles.skillsSection}
        title="技能"
        description="按技能分类填写职业、兴趣与成长点；母语、闪避和各类专精的基础值会自动计算。"
      >
        {selectedOccupation ? (
          <div
            className={`${styles.requirements} mb-5 border-b border-stone-300 pb-4`}
          >
            <h3 className="text-sm font-semibold text-stone-900">
              {selectedOccupation.name} · 本职技能要求
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
              {selectedOccupation.occupation_skills.map((rule, index) => {
                const isSatisfied = isOccupationSkillRuleSatisfied(
                  rule,
                  formState.skills,
                  occupationRuleProgress.fixedKeys,
                );

                return (
                  <li key={`${rule}-${index}`} className="flex gap-2">
                    <span aria-hidden="true" className="text-emerald-700">
                      {isSatisfied ? "●" : "○"}
                    </span>
                    <span>
                      {rule}
                      {!isSatisfied ? (
                        <span className="ml-2 text-xs text-amber-700">
                          请在技能表中勾选本职技能
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
            {occupationRuleProgress.required > 0 ? (
              <p
                className={`mt-3 text-sm ${
                  occupationRuleProgress.selected >=
                  occupationRuleProgress.required
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              >
                待选技能进度：已标记 {occupationRuleProgress.selected} / 至少{" "}
                {occupationRuleProgress.required} 项
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <ReadonlyNumberInput
            label="职业点数"
            value={
              occupationPointCalculation?.total ?? formState.occupation_points
            }
          />
          <ReadonlyNumberInput
            label="兴趣点数"
            value={getPersonalInterestPoints(formState.int)}
          />
          <NumberInput
            disabled={isSubmitting}
            label="技能上限"
            value={formState.skill_limit}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                skill_limit: asNumber(value),
              }))
            }
            min={0}
          />
        </div>

        {occupationPointCalculation ? (
          <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            本职技能点自动计算：{occupationPointCalculation.calculation}
          </p>
        ) : (
          <p className="mb-4 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-600">
            选择职业后将自动计算本职技能点。
          </p>
        )}

        <p className="mb-4 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700">
          兴趣点自动计算：智力 {formState.int} × 2 ＝{" "}
          {getPersonalInterestPoints(formState.int)}
        </p>

        {creditRangeError ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {creditRangeError}
          </p>
        ) : null}

        <Coc7SkillsEditor
          creditRange={
            selectedOccupation
              ? {
                  min: selectedOccupation.credit_min,
                  max: selectedOccupation.credit_max,
                  note: selectedOccupation.credit_note,
                }
              : null
          }
          disabled={isSubmitting}
          skills={formState.skills}
          onChange={updateSkill}
        />
      </Section>

      <Section title="武器">
        <div className="grid gap-3">
          {formState.weapons.map((weapon, index) => (
            <div
              key={index}
              className={`${styles.weaponRow} grid gap-3 rounded-md border border-stone-300 bg-white p-3 md:grid-cols-4 lg:grid-cols-8`}
            >
              <TextInput
                disabled={isSubmitting}
                label="武器名称"
                value={weapon.name}
                onChange={(value) => updateWeapon(index, "name", value)}
              />
              <TextInput
                disabled={isSubmitting}
                label="使用技能"
                value={weapon.skill}
                onChange={(value) => updateWeapon(index, "skill", value)}
              />
              <NumberInput
                disabled={isSubmitting}
                label="成功率"
                value={weapon.value}
                onChange={(value) => updateWeapon(index, "value", value)}
                min={0}
              />
              <TextInput
                disabled={isSubmitting}
                label="伤害"
                value={weapon.damage}
                onChange={(value) => updateWeapon(index, "damage", value)}
              />
              <TextInput
                disabled={isSubmitting}
                label="射程"
                value={weapon.range}
                onChange={(value) => updateWeapon(index, "range", value)}
              />
              <TextInput
                disabled={isSubmitting}
                label="次数"
                value={weapon.attacks}
                onChange={(value) => updateWeapon(index, "attacks", value)}
              />
              <TextInput
                disabled={isSubmitting}
                label="装弹量"
                value={weapon.ammo}
                onChange={(value) => updateWeapon(index, "ammo", value)}
              />
              <TextInput
                disabled={isSubmitting}
                label="故障"
                value={weapon.malfunction}
                onChange={(value) => updateWeapon(index, "malfunction", value)}
              />
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="装备与财产">
          <div className="space-y-4">
            <TextAreaInput
              disabled={isSubmitting}
              label="随身物品与装备（每行一项）"
              value={formState.equipment_text}
              onChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  equipment_text: value,
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                disabled={isSubmitting}
                label="现金"
                value={formState.cash}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, cash: value }))
                }
              />
              <TextInput
                disabled={isSubmitting}
                label="消费水平"
                value={formState.spending_level}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    spending_level: value,
                  }))
                }
              />
              <TextInput
                disabled={isSubmitting}
                label="资产"
                value={formState.assets}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, assets: value }))
                }
              />
              <TextInput
                disabled={isSubmitting}
                label="魔法物品与典籍"
                value={formState.magic_items}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    magic_items: value,
                  }))
                }
              />
            </div>
            <TextAreaInput
              disabled={isSubmitting}
              label="法术（每行一项）"
              value={formState.spells}
              onChange={(value) =>
                setFormState((current) => ({ ...current, spells: value }))
              }
              rows={3}
            />
          </div>
        </Section>

        <Section title="状态记录">
          <div className="space-y-4">
            <TextAreaInput
              disabled={isSubmitting}
              label="当前状态（每行一项）"
              value={formState.conditions}
              onChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  conditions: value,
                }))
              }
              rows={4}
            />
            <TextAreaInput
              disabled={isSubmitting}
              label="伤口记录（每行一项）"
              value={formState.wounds}
              onChange={(value) =>
                setFormState((current) => ({ ...current, wounds: value }))
              }
              rows={4}
            />
          </div>
        </Section>
      </div>

      <Section title="背景故事">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextAreaInput
            disabled={isSubmitting}
            label="形象描述"
            value={formState.personal_description}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                personal_description: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="思想与信念"
            value={formState.ideology}
            onChange={(value) =>
              setFormState((current) => ({ ...current, ideology: value }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="重要之人"
            value={formState.significant_people}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                significant_people: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="意义非凡之地"
            value={formState.meaningful_locations}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                meaningful_locations: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="宝贵之物"
            value={formState.treasured_possessions}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                treasured_possessions: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="特质"
            value={formState.traits}
            onChange={(value) =>
              setFormState((current) => ({ ...current, traits: value }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="伤口与疤痕"
            value={formState.injuries_scars}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                injuries_scars: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="恐惧症与躁狂症"
            value={formState.phobias_manias}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                phobias_manias: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="关系人（每行一项）"
            value={formState.relationships}
            onChange={(value) =>
              setFormState((current) => ({
                ...current,
                relationships: value,
              }))
            }
          />
          <TextAreaInput
            disabled={isSubmitting}
            label="第三类接触与经历"
            value={formState.encounters}
            onChange={(value) =>
              setFormState((current) => ({ ...current, encounters: value }))
            }
          />
          <div className="lg:col-span-2">
            <TextAreaInput
              disabled={isSubmitting}
              label="备注"
              value={formState.notes}
              onChange={(value) =>
                setFormState((current) => ({ ...current, notes: value }))
              }
            />
          </div>
        </div>
      </Section>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className={`${styles.primaryAction} rounded-md bg-stone-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400`}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}
