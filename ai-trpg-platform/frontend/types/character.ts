export type JsonRecord = Record<string, unknown>;

export type SupportedRule = {
  id: string;
  name: string;
  description: string;
};

export type CharacterListItem = {
  id: number;
  user_id: number;
  rule_system: string;
  name: string;
  summary: JsonRecord;
  created_at: string;
  updated_at: string;
};

export type CharacterRead = {
  id: number;
  user_id: number;
  rule_system: string;
  name: string;
  sheet: unknown;
  created_at: string;
  updated_at: string;
};

export type Coc7OccupationAttribute =
  | "str"
  | "dex"
  | "app"
  | "pow"
  | "edu";

export type Coc7OccupationFormulaTerm =
  | {
      attribute: Coc7OccupationAttribute;
      multiplier: number;
    }
  | {
      choose_one: Coc7OccupationAttribute[];
      multiplier: number;
    };

export type Coc7OccupationFormula = {
  type: "fixed" | "sum" | "choice";
  terms: Coc7OccupationFormulaTerm[];
};

export type Coc7Occupation = {
  id: number;
  name: string;
  description: string;
  skill_points_formula: string;
  skill_points_formula_json: Coc7OccupationFormula;
  credit_min: number;
  credit_max: number;
  credit_note: string | null;
  occupation_skills: string[];
  created_at?: string;
  updated_at?: string;
};

export type Coc7OccupationPointCalculation = {
  formula: string;
  selected_attribute: Coc7OccupationAttribute | null;
  selected_from: Coc7OccupationAttribute[];
  calculation: string;
  total: number;
};

export type Coc7CharacterCreate = {
  name: string;
  occupation?: string;
  occupation_id: number | null;
  occupation_skill_points: number;
  personal_interest_points: number;
  credit_rating: number;
  age: number;
  gender: string;
  residence: string;
  birthplace: string;
  background: string;
  str: number;
  con: number;
  siz: number;
  dex: number;
  app: number;
  int: number;
  pow: number;
  edu: number;
  luck: number;
  hp: number;
  max_hp: number;
  mp: number;
  san: number;
  build: number;
  damage_bonus: string;
  move: number;
  skills_json: JsonRecord;
  equipment_json: JsonRecord;
  backstory_json: JsonRecord;
  status_json: JsonRecord;
};

export type Coc7CharacterUpdate = Coc7CharacterCreate;

export type Dnd5eCharacterCreate = {
  name: string;
  race: string;
  class_name: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;
  player_name: string;
  experience_points: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  armor_class: number;
  initiative: number;
  speed: number;
  max_hp: number;
  current_hp: number;
  temporary_hp: number;
  hit_dice: string;
  proficiencies_json: JsonRecord;
  skills_json: JsonRecord;
  equipment_json: JsonRecord;
  spellcasting_json: JsonRecord;
  features_json: JsonRecord;
  status_json: JsonRecord;
};

export type Dnd5eCharacterUpdate = Dnd5eCharacterCreate;
