from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field


class Coc7SkillSpecializationRead(BaseModel):
    key: str
    name: str
    base_value: int
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class Coc7SkillDefinitionRead(BaseModel):
    key: str
    name: str
    category: str
    base_value: int | None
    base_formula: str | None
    allows_specialization: bool
    allows_custom_specialization: bool
    is_custom: bool
    sort_order: int
    note: str | None
    specializations: list[Coc7SkillSpecializationRead] = Field(default_factory=list)


class Coc7CharacterSkillInput(BaseModel):
    skill_key: str = Field(min_length=1, max_length=100)
    specialization_key: str | None = Field(default=None, max_length=100)
    custom_name: str | None = Field(default=None, min_length=1, max_length=100)
    custom_specialization: str | None = Field(default=None, min_length=1, max_length=100)
    base_value: int | None = Field(default=None, ge=0, le=100)
    occupation_points: int = Field(default=0, ge=0, le=999)
    interest_points: int = Field(default=0, ge=0, le=999)
    growth_points: int = Field(default=0, ge=0, le=999)
    is_occupation: bool = False
    improvement_checked: bool = False
    sort_order: int = Field(default=0, ge=0)


class Coc7CharacterSkillsUpdate(BaseModel):
    skills: list[Coc7CharacterSkillInput] = Field(default_factory=list, max_length=200)


class Coc7CharacterSkillRead(BaseModel):
    id: int
    skill_key: str
    name: str
    category: str
    specialization_key: str | None
    specialization_name: str | None
    custom_name: str | None
    custom_specialization: str | None
    base_value: int
    occupation_points: int
    interest_points: int
    growth_points: int
    is_occupation: bool
    improvement_checked: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def value(self) -> int:
        return (
            self.base_value
            + self.occupation_points
            + self.interest_points
            + self.growth_points
        )
