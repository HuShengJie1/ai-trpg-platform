from datetime import datetime
from typing import Any, TypeAlias

from pydantic import BaseModel, ConfigDict, Field

IntegerValue: TypeAlias = int
StringValue: TypeAlias = str


class Coc7CharacterBase(BaseModel):
    player_name: StringValue | None = Field(default=None, max_length=255)
    portrait_url: StringValue | None = Field(default=None, max_length=512)
    occupation: StringValue | None = Field(default=None, max_length=255)
    occupation_details: StringValue | None = None
    age: IntegerValue | None = Field(default=None, ge=0, le=150)
    gender: StringValue | None = Field(default=None, max_length=100)
    residence: StringValue | None = Field(default=None, max_length=255)
    birthplace: StringValue | None = Field(default=None, max_length=255)
    background: StringValue | None = None
    occupation_skill_points: IntegerValue = Field(default=0, ge=0)
    personal_interest_points: IntegerValue = Field(default=0, ge=0)
    credit_rating: IntegerValue = Field(default=0, ge=0, le=100)
    str: IntegerValue = Field(default=0, ge=0, le=100)
    con: IntegerValue = Field(default=0, ge=0, le=100)
    siz: IntegerValue = Field(default=0, ge=0, le=100)
    dex: IntegerValue = Field(default=0, ge=0, le=100)
    app: IntegerValue = Field(default=0, ge=0, le=100)
    int: IntegerValue = Field(default=0, ge=0, le=100)
    pow: IntegerValue = Field(default=0, ge=0, le=100)
    edu: IntegerValue = Field(default=0, ge=0, le=100)
    luck: IntegerValue = Field(default=0, ge=0, le=100)
    hp: IntegerValue = Field(default=0, ge=0)
    max_hp: IntegerValue = Field(default=0, ge=0)
    mp: IntegerValue = Field(default=0, ge=0)
    max_mp: IntegerValue = Field(default=0, ge=0)
    san: IntegerValue = Field(default=0, ge=0)
    starting_san: IntegerValue = Field(default=0, ge=0, le=100)
    max_san: IntegerValue = Field(default=99, ge=0, le=99)
    build: IntegerValue = 0
    damage_bonus: StringValue | None = Field(default=None, max_length=50)
    move: IntegerValue = Field(default=0, ge=0)
    spending_level: StringValue | None = Field(default=None, max_length=255)
    cash: StringValue | None = Field(default=None, max_length=255)
    assets: StringValue | None = None
    personal_description: StringValue | None = None
    ideology_beliefs: StringValue | None = None
    significant_people: StringValue | None = None
    meaningful_locations: StringValue | None = None
    treasured_possessions: StringValue | None = None
    traits: StringValue | None = None
    key_connection: StringValue | None = None
    injuries_scars: StringValue | None = None
    phobias_manias: StringValue | None = None
    arcane_tomes_spells_artifacts: StringValue | None = None
    encounters_with_strange_entities: StringValue | None = None
    notes: StringValue | None = None
    major_wound: bool = False
    unconscious: bool = False
    dying: bool = False
    temporary_insanity: bool = False
    indefinite_insanity: bool = False
    skills_json: dict[StringValue, Any] = Field(default_factory=dict)
    occupation_skills_json: dict[StringValue, Any] = Field(default_factory=dict)
    equipment_json: dict[StringValue, Any] = Field(default_factory=dict)
    weapons_json: dict[StringValue, Any] = Field(default_factory=dict)
    backstory_json: dict[StringValue, Any] = Field(default_factory=dict)
    status_json: dict[StringValue, Any] = Field(default_factory=dict)
    fellow_investigators_json: dict[StringValue, Any] = Field(default_factory=dict)
    development_json: dict[StringValue, Any] = Field(default_factory=dict)


class Coc7CharacterCreate(Coc7CharacterBase):
    name: StringValue = Field(min_length=1, max_length=255)


class Coc7CharacterUpdate(BaseModel):
    name: StringValue | None = Field(default=None, min_length=1, max_length=255)
    player_name: StringValue | None = Field(default=None, max_length=255)
    portrait_url: StringValue | None = Field(default=None, max_length=512)
    occupation: StringValue | None = Field(default=None, max_length=255)
    occupation_details: StringValue | None = None
    age: IntegerValue | None = Field(default=None, ge=0, le=150)
    gender: StringValue | None = Field(default=None, max_length=100)
    residence: StringValue | None = Field(default=None, max_length=255)
    birthplace: StringValue | None = Field(default=None, max_length=255)
    background: StringValue | None = None
    occupation_skill_points: IntegerValue | None = Field(default=None, ge=0)
    personal_interest_points: IntegerValue | None = Field(default=None, ge=0)
    credit_rating: IntegerValue | None = Field(default=None, ge=0, le=100)
    str: IntegerValue | None = Field(default=None, ge=0, le=100)
    con: IntegerValue | None = Field(default=None, ge=0, le=100)
    siz: IntegerValue | None = Field(default=None, ge=0, le=100)
    dex: IntegerValue | None = Field(default=None, ge=0, le=100)
    app: IntegerValue | None = Field(default=None, ge=0, le=100)
    int: IntegerValue | None = Field(default=None, ge=0, le=100)
    pow: IntegerValue | None = Field(default=None, ge=0, le=100)
    edu: IntegerValue | None = Field(default=None, ge=0, le=100)
    luck: IntegerValue | None = Field(default=None, ge=0, le=100)
    hp: IntegerValue | None = Field(default=None, ge=0)
    max_hp: IntegerValue | None = Field(default=None, ge=0)
    mp: IntegerValue | None = Field(default=None, ge=0)
    max_mp: IntegerValue | None = Field(default=None, ge=0)
    san: IntegerValue | None = Field(default=None, ge=0)
    starting_san: IntegerValue | None = Field(default=None, ge=0, le=100)
    max_san: IntegerValue | None = Field(default=None, ge=0, le=99)
    build: IntegerValue | None = None
    damage_bonus: StringValue | None = Field(default=None, max_length=50)
    move: IntegerValue | None = Field(default=None, ge=0)
    spending_level: StringValue | None = Field(default=None, max_length=255)
    cash: StringValue | None = Field(default=None, max_length=255)
    assets: StringValue | None = None
    personal_description: StringValue | None = None
    ideology_beliefs: StringValue | None = None
    significant_people: StringValue | None = None
    meaningful_locations: StringValue | None = None
    treasured_possessions: StringValue | None = None
    traits: StringValue | None = None
    key_connection: StringValue | None = None
    injuries_scars: StringValue | None = None
    phobias_manias: StringValue | None = None
    arcane_tomes_spells_artifacts: StringValue | None = None
    encounters_with_strange_entities: StringValue | None = None
    notes: StringValue | None = None
    major_wound: bool | None = None
    unconscious: bool | None = None
    dying: bool | None = None
    temporary_insanity: bool | None = None
    indefinite_insanity: bool | None = None
    skills_json: dict[StringValue, Any] | None = None
    occupation_skills_json: dict[StringValue, Any] | None = None
    equipment_json: dict[StringValue, Any] | None = None
    weapons_json: dict[StringValue, Any] | None = None
    backstory_json: dict[StringValue, Any] | None = None
    status_json: dict[StringValue, Any] | None = None
    fellow_investigators_json: dict[StringValue, Any] | None = None
    development_json: dict[StringValue, Any] | None = None


class Coc7CharacterSheetRead(Coc7CharacterBase):
    str: IntegerValue = Field(validation_alias="str_score", ge=0, le=100)
    int: IntegerValue = Field(validation_alias="int_score", ge=0, le=100)
    id: IntegerValue
    character_id: IntegerValue
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
