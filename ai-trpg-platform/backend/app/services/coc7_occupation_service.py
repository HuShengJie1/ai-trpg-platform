from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.coc7_character import Coc7CharacterSheet
from app.models.coc7_occupation import Coc7Occupation
from app.schemas.coc7_occupation import Coc7OccupationSkillPointsDetail


ATTRIBUTE_KEYS = {
    "教育": "edu",
    "敏捷": "dex",
    "力量": "str",
    "外貌": "app",
    "意志": "pow",
}
ATTRIBUTE_LABELS = {
    "str": "力量",
    "con": "体质",
    "siz": "体型",
    "dex": "敏捷",
    "app": "外貌",
    "int": "智力",
    "pow": "意志",
    "edu": "教育",
    "luck": "幸运",
}
REQUIRED_FIELDS = (
    "职业名称",
    "职业介绍",
    "本职技能点数",
    "信用范围",
    "本职技能",
)


@dataclass(frozen=True)
class Coc7OccupationImportResult:
    created: int
    updated: int

    @property
    def total(self) -> int:
        return self.created + self.updated


class MissingOccupationAttributeError(ValueError):
    pass


class InvalidOccupationFormulaError(ValueError):
    pass


def list_coc7_occupations(
    db: Session,
    search: str | None = None,
) -> list[Coc7Occupation]:
    statement = select(Coc7Occupation)
    normalized_search = search.strip() if search else ""
    if normalized_search:
        statement = statement.where(
            Coc7Occupation.name.ilike(f"%{normalized_search}%")
        )
    statement = statement.order_by(
        Coc7Occupation.name.asc(),
        Coc7Occupation.id.asc(),
    )
    return list(db.scalars(statement).all())


def get_coc7_occupation(db: Session, occupation_id: int) -> Coc7Occupation:
    occupation = db.get(Coc7Occupation, occupation_id)
    if occupation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="COC7 occupation not found",
        )
    return occupation


def calculate_occupation_skill_points(
    formula_json: Mapping[str, Any],
    attribute_values: Mapping[str, int | None],
    formula: str,
) -> Coc7OccupationSkillPointsDetail:
    formula_type = formula_json.get("type")
    terms = formula_json.get("terms")
    if formula_type not in {"fixed", "sum", "choice"} or not isinstance(terms, list):
        raise InvalidOccupationFormulaError("Unsupported occupation skill point formula")

    total = 0
    calculation_parts: list[str] = []
    selected_attribute: str | None = None
    for term in terms:
        if not isinstance(term, dict):
            raise InvalidOccupationFormulaError("Occupation formula terms must be objects")

        multiplier = term.get("multiplier")
        if isinstance(multiplier, bool) or not isinstance(multiplier, int) or multiplier <= 0:
            raise InvalidOccupationFormulaError(
                "Occupation formula multipliers must be positive integers"
            )

        attribute = term.get("attribute")
        choose_one = term.get("choose_one")
        if isinstance(attribute, str) and choose_one is None:
            value = _get_formula_attribute(attribute_values, attribute)
        elif attribute is None and isinstance(choose_one, list) and choose_one:
            if not all(isinstance(candidate, str) for candidate in choose_one):
                raise InvalidOccupationFormulaError(
                    "Occupation formula choices must be attribute names"
                )
            candidate_values = [
                (candidate, _get_formula_attribute(attribute_values, candidate))
                for candidate in choose_one
            ]
            attribute, value = max(candidate_values, key=lambda item: item[1])
            selected_attribute = attribute
        else:
            raise InvalidOccupationFormulaError(
                "Each occupation formula term must select one attribute"
            )

        total += value * multiplier
        calculation_parts.append(f"{value}×{multiplier}")

    return Coc7OccupationSkillPointsDetail(
        formula=formula,
        selected_attribute=selected_attribute,
        calculation="＋".join(calculation_parts),
        total=total,
    )


def calculate_coc7_occupation_skill_points(
    occupation: Coc7Occupation,
    attribute_values: Mapping[str, int | None] | Coc7CharacterSheet,
) -> Coc7OccupationSkillPointsDetail:
    values = (
        _sheet_attribute_values(attribute_values)
        if isinstance(attribute_values, Coc7CharacterSheet)
        else attribute_values
    )
    try:
        return calculate_occupation_skill_points(
            occupation.skill_points_formula_json,
            values,
            occupation.skill_points_formula,
        )
    except MissingOccupationAttributeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from None
    except InvalidOccupationFormulaError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="COC7 occupation skill point formula is invalid",
        ) from None


def build_coc7_occupation_skill_points_detail(
    db: Session,
    sheet: Coc7CharacterSheet,
) -> Coc7OccupationSkillPointsDetail | None:
    if sheet.occupation_id is None:
        return None
    occupation = get_coc7_occupation(db, sheet.occupation_id)
    return calculate_coc7_occupation_skill_points(occupation, sheet)


def _get_formula_attribute(
    attribute_values: Mapping[str, int | None],
    attribute: str,
) -> int:
    if attribute not in ATTRIBUTE_LABELS:
        raise InvalidOccupationFormulaError(
            f"Unknown occupation formula attribute: {attribute}"
        )
    value = attribute_values.get(attribute)
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        label = ATTRIBUTE_LABELS[attribute]
        raise MissingOccupationAttributeError(
            f"COC7 occupation formula requires a positive {label} ({attribute}) value"
        )
    return value


def _sheet_attribute_values(sheet: Coc7CharacterSheet) -> dict[str, int]:
    return {
        "str": sheet.str_score,
        "con": sheet.con,
        "siz": sheet.siz,
        "dex": sheet.dex,
        "app": sheet.app,
        "int": sheet.int_score,
        "pow": sheet.pow,
        "edu": sheet.edu,
        "luck": sheet.luck,
    }


def parse_skill_points_formula(formula: str) -> dict[str, Any]:
    compact = re.sub(r"\s+", "", formula)
    compact = re.sub(r"（[^）]*）", "", compact)

    if compact == "教育×4":
        return {
            "type": "fixed",
            "terms": [{"attribute": "edu", "multiplier": 4}],
        }

    match = re.fullmatch(r"教育×2[＋+](.+)×2", compact)
    if match is None:
        raise ValueError(f"无法识别本职技能点数公式：{formula}")

    attribute_names = match.group(1).split("或")
    try:
        attribute_keys = [ATTRIBUTE_KEYS[name] for name in attribute_names]
    except KeyError as exc:
        raise ValueError(f"公式包含未知属性：{exc.args[0]}") from exc

    first_term = {"attribute": "edu", "multiplier": 2}
    if len(attribute_keys) == 1:
        return {
            "type": "sum",
            "terms": [
                first_term,
                {"attribute": attribute_keys[0], "multiplier": 2},
            ],
        }

    return {
        "type": "choice",
        "terms": [
            first_term,
            {"choose_one": attribute_keys, "multiplier": 2},
        ],
    }


def parse_credit_range(value: str) -> tuple[int, int, str | None]:
    match = re.fullmatch(r"\s*(\d+)\s*[-–—~～]\s*(\d+)\s*(.*?)\s*", value)
    if match is None:
        raise ValueError(f"无法识别信用范围：{value}")

    credit_min = int(match.group(1))
    credit_max = int(match.group(2))
    if not 0 <= credit_min <= credit_max <= 99:
        raise ValueError(f"信用范围必须满足 0 <= 最小值 <= 最大值 <= 99：{value}")

    note = match.group(3).strip()
    if (note.startswith("（") and note.endswith("）")) or (
        note.startswith("(") and note.endswith(")")
    ):
        note = note[1:-1].strip()

    return credit_min, credit_max, note or None


def load_coc7_occupation_records(json_path: str | Path) -> list[dict[str, Any]]:
    path = Path(json_path)
    with path.open(encoding="utf-8") as source_file:
        source = json.load(source_file)

    if not isinstance(source, list):
        raise ValueError("职业 JSON 的顶层必须是数组")

    records: list[dict[str, Any]] = []
    seen_names: set[str] = set()
    for position, item in enumerate(source, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"第 {position} 条职业数据必须是对象")

        missing_fields = [field for field in REQUIRED_FIELDS if field not in item]
        if missing_fields:
            raise ValueError(
                f"第 {position} 条职业数据缺少字段：{', '.join(missing_fields)}"
            )

        name = item["职业名称"]
        description = item["职业介绍"]
        formula = item["本职技能点数"]
        credit_range = item["信用范围"]
        skills = item["本职技能"]
        if not isinstance(name, str) or not name.strip():
            raise ValueError(f"第 {position} 条职业名称必须是非空字符串")
        if name in seen_names:
            raise ValueError(f"职业名称重复：{name}")
        if not isinstance(description, str) or not description.strip():
            raise ValueError(f"职业 {name} 的介绍必须是非空字符串")
        if not isinstance(formula, str):
            raise ValueError(f"职业 {name} 的技能点公式必须是字符串")
        if not isinstance(credit_range, str):
            raise ValueError(f"职业 {name} 的信用范围必须是字符串")
        if not isinstance(skills, list) or not skills or not all(
            isinstance(skill, str) and skill.strip() for skill in skills
        ):
            raise ValueError(f"职业 {name} 的本职技能必须是非空字符串数组")

        credit_min, credit_max, credit_note = parse_credit_range(credit_range)
        records.append(
            {
                "name": name.strip(),
                "description": description.strip(),
                "skill_points_formula": formula.strip(),
                "skill_points_formula_json": parse_skill_points_formula(formula),
                "credit_min": credit_min,
                "credit_max": credit_max,
                "credit_note": credit_note,
                "occupation_skills_json": [skill.strip() for skill in skills],
            }
        )
        seen_names.add(name)

    return records


def import_coc7_occupations(
    db: Session,
    json_path: str | Path,
) -> Coc7OccupationImportResult:
    records = load_coc7_occupation_records(json_path)
    names = [record["name"] for record in records]
    existing_by_name = {
        occupation.name: occupation
        for occupation in db.scalars(
            select(Coc7Occupation).where(Coc7Occupation.name.in_(names))
        ).all()
    }

    created = 0
    updated = 0
    for record in records:
        occupation = existing_by_name.get(record["name"])
        if occupation is None:
            db.add(Coc7Occupation(**record))
            created += 1
            continue

        for field, value in record.items():
            setattr(occupation, field, value)
        updated += 1

    db.commit()
    return Coc7OccupationImportResult(created=created, updated=updated)


def main() -> None:
    parser = argparse.ArgumentParser(description="导入 COC7 调查员职业 JSON")
    parser.add_argument("json_path", type=Path, help="调查员职业设置 JSON 文件路径")
    args = parser.parse_args()

    with SessionLocal() as db:
        result = import_coc7_occupations(db, args.json_path)

    print(
        f"COC7 occupations imported: {result.total} "
        f"(created={result.created}, updated={result.updated})"
    )


if __name__ == "__main__":
    main()
