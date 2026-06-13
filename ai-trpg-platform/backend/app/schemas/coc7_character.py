from datetime import datetime
from typing import Any, TypeAlias

from pydantic import BaseModel, ConfigDict, Field

IntegerValue: TypeAlias = int
StringValue: TypeAlias = str


class Coc7CharacterBase(BaseModel):
    occupation: StringValue | None = Field(default=None, max_length=255)
    age: IntegerValue | None = Field(default=None, ge=0, le=150)
    gender: StringValue | None = Field(default=None, max_length=100)
    residence: StringValue | None = Field(default=None, max_length=255)
    birthplace: StringValue | None = Field(default=None, max_length=255)
    background: StringValue | None = None
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
    mp: IntegerValue = Field(default=0, ge=0)
    san: IntegerValue = Field(default=0, ge=0)
    build: IntegerValue = 0
    damage_bonus: StringValue | None = Field(default=None, max_length=50)
    move: IntegerValue = Field(default=0, ge=0)
    skills_json: dict[StringValue, Any] = Field(default_factory=dict)
    equipment_json: dict[StringValue, Any] = Field(default_factory=dict)
    backstory_json: dict[StringValue, Any] = Field(default_factory=dict)
    status_json: dict[StringValue, Any] = Field(default_factory=dict)


class Coc7CharacterCreate(Coc7CharacterBase):
    name: StringValue = Field(min_length=1, max_length=255)


class Coc7CharacterUpdate(BaseModel):
    name: StringValue | None = Field(default=None, min_length=1, max_length=255)
    occupation: StringValue | None = Field(default=None, max_length=255)
    age: IntegerValue | None = Field(default=None, ge=0, le=150)
    gender: StringValue | None = Field(default=None, max_length=100)
    residence: StringValue | None = Field(default=None, max_length=255)
    birthplace: StringValue | None = Field(default=None, max_length=255)
    background: StringValue | None = None
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
    mp: IntegerValue | None = Field(default=None, ge=0)
    san: IntegerValue | None = Field(default=None, ge=0)
    build: IntegerValue | None = None
    damage_bonus: StringValue | None = Field(default=None, max_length=50)
    move: IntegerValue | None = Field(default=None, ge=0)
    skills_json: dict[StringValue, Any] | None = None
    equipment_json: dict[StringValue, Any] | None = None
    backstory_json: dict[StringValue, Any] | None = None
    status_json: dict[StringValue, Any] | None = None


class Coc7CharacterSheetRead(Coc7CharacterBase):
    str: IntegerValue = Field(validation_alias="str_score", ge=0, le=100)
    int: IntegerValue = Field(validation_alias="int_score", ge=0, le=100)
    id: IntegerValue
    character_id: IntegerValue
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
