from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Dnd5eCharacterBase(BaseModel):
    race: str | None = Field(default=None, max_length=255)
    class_name: str | None = Field(default=None, max_length=255)
    subclass: str | None = Field(default=None, max_length=255)
    level: int = Field(default=1, ge=1, le=20)
    background: str | None = None
    alignment: str | None = Field(default=None, max_length=100)
    player_name: str | None = Field(default=None, max_length=255)
    experience_points: int = Field(default=0, ge=0)
    strength: int = Field(default=10, ge=1, le=30)
    dexterity: int = Field(default=10, ge=1, le=30)
    constitution: int = Field(default=10, ge=1, le=30)
    intelligence: int = Field(default=10, ge=1, le=30)
    wisdom: int = Field(default=10, ge=1, le=30)
    charisma: int = Field(default=10, ge=1, le=30)
    armor_class: int = Field(default=10, ge=0)
    initiative: int = 0
    speed: int = Field(default=30, ge=0)
    max_hp: int = Field(default=0, ge=0)
    current_hp: int = Field(default=0, ge=0)
    temporary_hp: int = Field(default=0, ge=0)
    hit_dice: str | None = Field(default=None, max_length=50)
    proficiencies_json: dict[str, Any] = Field(default_factory=dict)
    skills_json: dict[str, Any] = Field(default_factory=dict)
    equipment_json: dict[str, Any] = Field(default_factory=dict)
    spellcasting_json: dict[str, Any] = Field(default_factory=dict)
    features_json: dict[str, Any] = Field(default_factory=dict)
    status_json: dict[str, Any] = Field(default_factory=dict)


class Dnd5eCharacterCreate(Dnd5eCharacterBase):
    name: str = Field(min_length=1, max_length=255)


class Dnd5eCharacterUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    race: str | None = Field(default=None, max_length=255)
    class_name: str | None = Field(default=None, max_length=255)
    subclass: str | None = Field(default=None, max_length=255)
    level: int | None = Field(default=None, ge=1, le=20)
    background: str | None = None
    alignment: str | None = Field(default=None, max_length=100)
    player_name: str | None = Field(default=None, max_length=255)
    experience_points: int | None = Field(default=None, ge=0)
    strength: int | None = Field(default=None, ge=1, le=30)
    dexterity: int | None = Field(default=None, ge=1, le=30)
    constitution: int | None = Field(default=None, ge=1, le=30)
    intelligence: int | None = Field(default=None, ge=1, le=30)
    wisdom: int | None = Field(default=None, ge=1, le=30)
    charisma: int | None = Field(default=None, ge=1, le=30)
    armor_class: int | None = Field(default=None, ge=0)
    initiative: int | None = None
    speed: int | None = Field(default=None, ge=0)
    max_hp: int | None = Field(default=None, ge=0)
    current_hp: int | None = Field(default=None, ge=0)
    temporary_hp: int | None = Field(default=None, ge=0)
    hit_dice: str | None = Field(default=None, max_length=50)
    proficiencies_json: dict[str, Any] | None = None
    skills_json: dict[str, Any] | None = None
    equipment_json: dict[str, Any] | None = None
    spellcasting_json: dict[str, Any] | None = None
    features_json: dict[str, Any] | None = None
    status_json: dict[str, Any] | None = None


class Dnd5eCharacterSheetRead(Dnd5eCharacterBase):
    id: int
    character_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
