from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Coc7OccupationRead(BaseModel):
    id: int
    name: str
    description: str
    skill_points_formula: str
    skill_points_formula_json: dict[str, Any]
    credit_min: int
    credit_max: int
    credit_note: str | None
    occupation_skills: list[str] = Field(validation_alias="occupation_skills_json")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class Coc7OccupationSkillPointsDetail(BaseModel):
    formula: str
    selected_attribute: str | None = None
    calculation: str
    total: int
