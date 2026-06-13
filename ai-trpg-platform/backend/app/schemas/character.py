from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class SupportedRuleRead(BaseModel):
    id: str
    name: str
    description: str


class CharacterListItem(BaseModel):
    id: int
    user_id: int
    rule_system: str
    name: str
    summary: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CharacterRead(BaseModel):
    id: int
    user_id: int
    rule_system: str
    name: str
    sheet: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
