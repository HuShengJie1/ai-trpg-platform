import json

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models.coc7_occupation import Coc7Occupation
from app.services.coc7_occupation_service import (
    MissingOccupationAttributeError,
    calculate_occupation_skill_points,
    import_coc7_occupations,
    load_coc7_occupation_records,
    parse_credit_range,
    parse_skill_points_formula,
)


def test_parse_fixed_skill_points_formula():
    assert parse_skill_points_formula("教育×4") == {
        "type": "fixed",
        "terms": [{"attribute": "edu", "multiplier": 4}],
    }


def test_parse_choice_skill_points_formula_with_note():
    assert parse_skill_points_formula(
        "教育×2 ＋意志或敏捷（译注：原文作外貌，此处依规则书改为敏捷）×2"
    ) == {
        "type": "choice",
        "terms": [
            {"attribute": "edu", "multiplier": 2},
            {"choose_one": ["pow", "dex"], "multiplier": 2},
        ],
    }


def test_parse_credit_range_with_note():
    assert parse_credit_range("10-80（取决于收入）") == (10, 80, "取决于收入")


def test_calculate_fixed_and_sum_skill_points():
    fixed = calculate_occupation_skill_points(
        {"type": "fixed", "terms": [{"attribute": "edu", "multiplier": 4}]},
        {"edu": 65},
        "教育×4",
    )
    summed = calculate_occupation_skill_points(
        {
            "type": "sum",
            "terms": [
                {"attribute": "edu", "multiplier": 2},
                {"attribute": "dex", "multiplier": 2},
            ],
        },
        {"edu": 60, "dex": 70},
        "教育×2＋敏捷×2",
    )

    assert fixed.total == 260
    assert fixed.calculation == "65×4"
    assert fixed.selected_attribute is None
    assert summed.total == 260
    assert summed.calculation == "60×2＋70×2"


def test_calculate_choice_uses_maximum_and_formula_order_for_ties():
    formula = {
        "type": "choice",
        "terms": [
            {"attribute": "edu", "multiplier": 2},
            {"choose_one": ["str", "dex"], "multiplier": 2},
        ],
    }

    maximum = calculate_occupation_skill_points(
        formula,
        {"edu": 60, "str": 65, "dex": 75},
        "教育×2＋力量或敏捷×2",
    )
    tied = calculate_occupation_skill_points(
        formula,
        {"edu": 60, "str": 70, "dex": 70},
        "教育×2＋力量或敏捷×2",
    )

    assert maximum.selected_attribute == "dex"
    assert maximum.total == 270
    assert tied.selected_attribute == "str"
    assert tied.total == 260


def test_calculate_skill_points_rejects_missing_formula_attribute():
    with pytest.raises(MissingOccupationAttributeError):
        calculate_occupation_skill_points(
            {"type": "fixed", "terms": [{"attribute": "edu", "multiplier": 4}]},
            {"edu": 0},
            "教育×4",
        )


def test_load_and_import_coc7_occupations(tmp_path):
    source_path = tmp_path / "occupations.json"
    source = [
        {
            "职业名称": "测试职业",
            "职业介绍": "仅用于自动化测试。",
            "本职技能点数": "教育×2 ＋敏捷或力量×2",
            "信用范围": "30-70",
            "本职技能": ["会计", "任意其他两项个人或时代特长"],
        }
    ]
    source_path.write_text(json.dumps(source, ensure_ascii=False), encoding="utf-8")

    records = load_coc7_occupation_records(source_path)
    assert records[0]["credit_min"] == 30
    assert records[0]["credit_max"] == 70
    assert records[0]["occupation_skills_json"] == [
        "会计",
        "任意其他两项个人或时代特长",
    ]

    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    with testing_session_local() as db:
        first_result = import_coc7_occupations(db, source_path)
        assert first_result.created == 1
        assert first_result.updated == 0

        source[0]["职业介绍"] = "更新后的测试介绍。"
        source_path.write_text(json.dumps(source, ensure_ascii=False), encoding="utf-8")
        second_result = import_coc7_occupations(db, source_path)
        assert second_result.created == 0
        assert second_result.updated == 1

        occupation = db.scalar(select(Coc7Occupation))
        assert occupation is not None
        assert occupation.description == "更新后的测试介绍。"
        assert occupation.skill_points_formula_json["type"] == "choice"

    Base.metadata.drop_all(bind=engine)
