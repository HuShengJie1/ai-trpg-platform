import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models.coc7_occupation import Coc7Occupation
from app.services.coc7_skill_service import seed_coc7_skill_catalog


@pytest.fixture()
def client():
    settings.secret_key = "test-secret-key"
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    with testing_session_local() as db:
        seed_coc7_skill_catalog(db)
        db.add_all(
            [
                Coc7Occupation(
                    name="侦探",
                    description="测试职业：调查案件。",
                    skill_points_formula="教育×2＋力量或敏捷×2",
                    skill_points_formula_json={
                        "type": "choice",
                        "terms": [
                            {"attribute": "edu", "multiplier": 2},
                            {"choose_one": ["str", "dex"], "multiplier": 2},
                        ],
                    },
                    credit_min=20,
                    credit_max=70,
                    credit_note=None,
                    occupation_skills_json=["侦查", "图书馆使用"],
                ),
                Coc7Occupation(
                    name="教授",
                    description="测试职业：从事学术工作。",
                    skill_points_formula="教育×4",
                    skill_points_formula_json={
                        "type": "fixed",
                        "terms": [{"attribute": "edu", "multiplier": 4}],
                    },
                    credit_min=20,
                    credit_max=70,
                    credit_note="测试备注",
                    occupation_skills_json=["图书馆使用", "母语"],
                ),
                Coc7Occupation(
                    name="记者",
                    description="测试职业：报道新闻。",
                    skill_points_formula="教育×2＋外貌×2",
                    skill_points_formula_json={
                        "type": "sum",
                        "terms": [
                            {"attribute": "edu", "multiplier": 2},
                            {"attribute": "app", "multiplier": 2},
                        ],
                    },
                    credit_min=10,
                    credit_max=50,
                    credit_note=None,
                    occupation_skills_json=["话术", "摄影"],
                ),
            ]
        )
        db.commit()

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def register_and_login(client: TestClient, username: str, email: str) -> str:
    register_response = client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "secret123",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": email, "password": "secret123"},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def occupation_id(client: TestClient, name: str) -> int:
    response = client.get("/characters/coc7/occupations", params={"search": name})
    assert response.status_code == 200
    matches = [item for item in response.json() if item["name"] == name]
    assert len(matches) == 1
    return matches[0]["id"]


def coc7_payload(name: str = "Dr. Armitage") -> dict:
    return {
        "name": name,
        "player_name": "Alice",
        "portrait_url": "https://example.com/portrait.png",
        "occupation": "Professor",
        "occupation_details": "Academic investigator",
        "age": 42,
        "gender": "Unknown",
        "residence": "Arkham",
        "birthplace": "Boston",
        "background": "A brief original test background.",
        "occupation_skill_points": 300,
        "personal_interest_points": 160,
        "credit_rating": 40,
        "str": 50,
        "con": 55,
        "siz": 60,
        "dex": 45,
        "app": 40,
        "int": 80,
        "pow": 65,
        "edu": 75,
        "luck": 70,
        "hp": 11,
        "max_hp": 11,
        "mp": 13,
        "max_mp": 13,
        "san": 65,
        "starting_san": 65,
        "max_san": 99,
        "build": 0,
        "damage_bonus": "0",
        "move": 8,
        "spending_level": "standard",
        "cash": "modest cash on hand",
        "assets": "research library access",
        "personal_description": "Careful and observant.",
        "ideology_beliefs": "Truth should be documented.",
        "significant_people": "A trusted colleague.",
        "meaningful_locations": "A quiet archive.",
        "treasured_possessions": "A field notebook.",
        "traits": "Curious",
        "key_connection": "A trusted colleague.",
        "injuries_scars": "Old shoulder scar.",
        "phobias_manias": "",
        "arcane_tomes_spells_artifacts": "",
        "encounters_with_strange_entities": "",
        "notes": "Original test notes.",
        "major_wound": False,
        "unconscious": False,
        "dying": False,
        "temporary_insanity": False,
        "indefinite_insanity": False,
        "skills_json": {"library_use": 60},
        "occupation_skills_json": {"library_use": True},
        "equipment_json": {"items": ["notebook"]},
        "weapons_json": {"weapons": [{"name": "walking stick", "skill": "fighting"}]},
        "backstory_json": {"notes": "test only"},
        "status_json": {"conditions": []},
        "fellow_investigators_json": {"allies": [{"name": "Mira", "note": "fellow PC"}]},
        "development_json": {"skill_checks": []},
    }


def dnd5e_payload(name: str = "Mira") -> dict:
    return {
        "name": name,
        "race": "Human",
        "class_name": "Fighter",
        "subclass": None,
        "level": 3,
        "background": "A brief original test background.",
        "alignment": "Neutral",
        "player_name": "Alice",
        "experience_points": 900,
        "strength": 16,
        "dexterity": 12,
        "constitution": 14,
        "intelligence": 10,
        "wisdom": 11,
        "charisma": 13,
        "armor_class": 16,
        "initiative": 1,
        "speed": 30,
        "max_hp": 28,
        "current_hp": 28,
        "temporary_hp": 0,
        "hit_dice": "3d10",
        "proficiencies_json": {"armor": ["light", "medium"]},
        "skills_json": {"athletics": 5},
        "equipment_json": {"items": ["sword"]},
        "spellcasting_json": {},
        "features_json": {"features": ["original test feature"]},
        "status_json": {"conditions": []},
    }


def create_coc7(client: TestClient, token: str, name: str = "Dr. Armitage") -> dict:
    response = client.post(
        "/characters/coc7",
        json=coc7_payload(name),
        headers=auth_headers(token),
    )
    assert response.status_code == 201
    return response.json()


def create_dnd5e(client: TestClient, token: str, name: str = "Mira") -> dict:
    response = client.post(
        "/characters/dnd5e",
        json=dnd5e_payload(name),
        headers=auth_headers(token),
    )
    assert response.status_code == 201
    return response.json()


def test_get_supported_rules_returns_coc7_and_dnd5e(client: TestClient):
    response = client.get("/characters/rules")

    assert response.status_code == 200
    data = response.json()
    assert {rule["id"] for rule in data} == {"coc7", "dnd5e"}


def test_get_coc7_skill_catalog(client: TestClient):
    response = client.get("/characters/coc7/skill-catalog")

    assert response.status_code == 200
    catalog = {skill["key"]: skill for skill in response.json()}
    assert catalog["spot_hidden"]["base_value"] == 25
    assert catalog["own_language"]["base_formula"] == "edu"
    assert catalog["dodge"]["base_formula"] == "dex_half"
    assert catalog["swim"]["name"] == "游泳"
    assert catalog["swim"]["base_value"] == 20
    assert catalog["swim"]["category"] == "physical"
    assert catalog["fighting"]["allows_specialization"] is True
    fighting_specializations = {
        specialization["key"]: specialization
        for specialization in catalog["fighting"]["specializations"]
    }
    assert fighting_specializations["brawl"]["base_value"] == 25
    science_specializations = {
        specialization["key"]: specialization
        for specialization in catalog["science"]["specializations"]
    }
    assert science_specializations["mathematics"]["base_value"] == 10
    assert science_specializations["physics"]["base_value"] == 1


def test_list_search_and_read_coc7_occupations(client: TestClient):
    list_response = client.get("/characters/coc7/occupations")

    assert list_response.status_code == 200
    occupations = list_response.json()
    assert [item["name"] for item in occupations] == sorted(
        item["name"] for item in occupations
    )
    assert all("occupation_skills" in item for item in occupations)
    assert all("occupation_skills_json" not in item for item in occupations)

    search_response = client.get(
        "/characters/coc7/occupations",
        params={"search": "侦探"},
    )
    assert search_response.status_code == 200
    assert [item["name"] for item in search_response.json()] == ["侦探"]

    selected = search_response.json()[0]
    detail_response = client.get(
        f"/characters/coc7/occupations/{selected['id']}"
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["occupation_skills"] == ["侦查", "图书馆使用"]

    missing_response = client.get("/characters/coc7/occupations/999999")
    assert missing_response.status_code == 404
    assert missing_response.json()["detail"] == "COC7 occupation not found"


def test_linked_occupation_overrides_snapshot_and_skill_points(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = coc7_payload()
    payload.update(
        {
            "occupation_id": occupation_id(client, "教授"),
            "occupation": "untrusted name",
            "occupation_skill_points": 9999,
        }
    )

    response = client.post(
        "/characters/coc7",
        json=payload,
        headers=auth_headers(token),
    )

    assert response.status_code == 201
    sheet = response.json()["sheet"]
    assert sheet["occupation_id"] == payload["occupation_id"]
    assert sheet["occupation"] == "教授"
    assert sheet["occupation_skill_points"] == 300
    assert sheet["occupation_skill_points_detail"] == {
        "formula": "教育×4",
        "selected_attribute": None,
        "calculation": "75×4",
        "total": 300,
    }


def test_updating_occupation_and_attributes_recalculates_skill_points(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = coc7_payload()
    payload["occupation_id"] = occupation_id(client, "教授")
    created_response = client.post(
        "/characters/coc7",
        json=payload,
        headers=auth_headers(token),
    )
    assert created_response.status_code == 201
    character_id = created_response.json()["id"]

    changed_occupation = client.put(
        f"/characters/coc7/{character_id}",
        json={
            "occupation_id": occupation_id(client, "侦探"),
            "occupation": "ignored snapshot",
            "str": 80,
            "dex": 80,
            "occupation_skill_points": 1,
        },
        headers=auth_headers(token),
    )
    assert changed_occupation.status_code == 200
    changed_sheet = changed_occupation.json()["sheet"]
    assert changed_sheet["occupation"] == "侦探"
    assert changed_sheet["occupation_skill_points"] == 310
    assert changed_sheet["occupation_skill_points_detail"]["selected_attribute"] == "str"

    changed_attribute = client.put(
        f"/characters/coc7/{character_id}",
        json={"dex": 90},
        headers=auth_headers(token),
    )
    assert changed_attribute.status_code == 200
    recalculated_sheet = changed_attribute.json()["sheet"]
    assert recalculated_sheet["occupation_skill_points"] == 330
    assert recalculated_sheet["occupation_skill_points_detail"]["selected_attribute"] == "dex"


def test_linked_occupation_validation_and_legacy_character_compatibility(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    invalid_payload = coc7_payload()
    invalid_payload["occupation_id"] = 999999

    invalid_response = client.post(
        "/characters/coc7",
        json=invalid_payload,
        headers=auth_headers(token),
    )
    assert invalid_response.status_code == 404

    legacy = create_coc7(client, token, name="Legacy Investigator")
    invalid_update_response = client.put(
        f"/characters/coc7/{legacy['id']}",
        json={"occupation_id": 999999},
        headers=auth_headers(token),
    )
    assert invalid_update_response.status_code == 404

    missing_attribute_payload = coc7_payload("Missing EDU")
    missing_attribute_payload["occupation_id"] = occupation_id(client, "教授")
    missing_attribute_payload["edu"] = 0
    missing_attribute_response = client.post(
        "/characters/coc7",
        json=missing_attribute_payload,
        headers=auth_headers(token),
    )
    assert missing_attribute_response.status_code == 422

    detail_response = client.get(
        f"/characters/{legacy['id']}",
        headers=auth_headers(token),
    )
    assert detail_response.status_code == 200
    legacy_sheet = detail_response.json()["sheet"]
    assert legacy_sheet["occupation_id"] is None
    assert legacy_sheet["occupation"] == "Professor"
    assert legacy_sheet["occupation_skill_points"] == 300
    assert legacy_sheet["occupation_skill_points_detail"] is None


def test_list_characters_returns_structured_summaries(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    coc7 = create_coc7(client, token)
    dnd5e = create_dnd5e(client, token)

    response = client.get("/characters", headers=auth_headers(token))

    assert response.status_code == 200
    by_id = {character["id"]: character for character in response.json()}
    assert by_id[coc7["id"]]["summary"] == {
        "occupation": "Professor",
        "age": 42,
        "hp": 11,
        "mp": 13,
        "san": 65,
    }
    assert by_id[dnd5e["id"]]["summary"] == {
        "race": "Human",
        "class_name": "Fighter",
        "level": 3,
        "current_hp": 28,
        "armor_class": 16,
    }


def test_unauthenticated_cannot_create_coc7_character(client: TestClient):
    response = client.post("/characters/coc7", json=coc7_payload())

    assert response.status_code == 401


def test_authenticated_user_can_create_get_update_and_delete_coc7_character(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")

    created = create_coc7(client, token)

    assert created["rule_system"] == "coc7"
    assert created["name"] == "Dr. Armitage"
    assert created["sheet"]["occupation"] == "Professor"
    assert created["sheet"]["player_name"] == "Alice"
    assert created["sheet"]["credit_rating"] == 40
    assert created["sheet"]["personal_description"] == "Careful and observant."
    assert created["sheet"]["weapons_json"]["weapons"][0]["name"] == "walking stick"

    detail_response = client.get(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["sheet"]["skills_json"]["library_use"] == 60

    update_response = client.put(
        f"/characters/coc7/{created['id']}",
        json={
            "name": "Updated Investigator",
            "occupation": "Archivist",
            "san": 60,
            "major_wound": True,
            "cash": "updated cash note",
        },
        headers=auth_headers(token),
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["name"] == "Updated Investigator"
    assert updated["sheet"]["occupation"] == "Archivist"
    assert updated["sheet"]["san"] == 60
    assert updated["sheet"]["major_wound"] is True
    assert updated["sheet"]["cash"] == "updated cash note"

    delete_response = client.delete(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert delete_response.status_code == 204

    missing_response = client.get(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert missing_response.status_code == 404


def test_replace_and_read_coc7_character_skills(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    created = create_coc7(client, token)
    payload = {
        "skills": [
            {
                "skill_key": "spot_hidden",
                "occupation_points": 20,
                "interest_points": 5,
                "is_occupation": True,
            },
            {"skill_key": "own_language"},
            {"skill_key": "dodge"},
            {
                "skill_key": "fighting",
                "specialization_key": "brawl",
                "growth_points": 5,
            },
            {
                "skill_key": "science",
                "specialization_key": "physics",
                "interest_points": 19,
            },
            {
                "skill_key": "custom",
                "custom_name": "地方传说",
                "base_value": 5,
                "interest_points": 25,
            },
        ]
    }

    update_response = client.put(
        f"/characters/coc7/{created['id']}/skills",
        json=payload,
        headers=auth_headers(token),
    )

    assert update_response.status_code == 200
    skills = update_response.json()
    by_key = {skill["skill_key"]: skill for skill in skills}
    assert by_key["spot_hidden"]["base_value"] == 25
    assert by_key["spot_hidden"]["value"] == 50
    assert by_key["own_language"]["base_value"] == 75
    assert by_key["dodge"]["base_value"] == 22
    assert by_key["fighting"]["specialization_key"] == "brawl"
    assert by_key["fighting"]["value"] == 30
    assert by_key["science"]["specialization_name"] == "物理"
    assert by_key["science"]["value"] == 20
    assert by_key["custom"]["name"] == "地方传说"
    assert by_key["custom"]["value"] == 30

    read_response = client.get(
        f"/characters/coc7/{created['id']}/skills",
        headers=auth_headers(token),
    )
    assert read_response.status_code == 200
    assert read_response.json() == skills


def test_coc7_character_skill_rejects_invalid_specialization(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    created = create_coc7(client, token)

    response = client.put(
        f"/characters/coc7/{created['id']}/skills",
        json={
            "skills": [
                {
                    "skill_key": "fighting",
                    "specialization_key": "not-a-real-specialization",
                }
            ]
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 400


def test_user_cannot_manage_another_users_coc7_skills(client: TestClient):
    alice_token = register_and_login(client, "alice", "alice@example.com")
    bob_token = register_and_login(client, "bob", "bob@example.com")
    created = create_coc7(client, alice_token)

    read_response = client.get(
        f"/characters/coc7/{created['id']}/skills",
        headers=auth_headers(bob_token),
    )
    update_response = client.put(
        f"/characters/coc7/{created['id']}/skills",
        json={"skills": []},
        headers=auth_headers(bob_token),
    )

    assert read_response.status_code == 404
    assert update_response.status_code == 404


def test_coc7_attribute_out_of_range_fails(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = coc7_payload()
    payload["str"] = 101

    response = client.post("/characters/coc7", json=payload, headers=auth_headers(token))

    assert response.status_code == 422


def test_coc7_credit_rating_out_of_range_fails(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = coc7_payload()
    payload["credit_rating"] = 101

    response = client.post("/characters/coc7", json=payload, headers=auth_headers(token))

    assert response.status_code == 422


def test_cannot_update_coc7_character_with_dnd5e_endpoint(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    created = create_coc7(client, token)

    response = client.put(
        f"/characters/dnd5e/{created['id']}",
        json={"level": 4},
        headers=auth_headers(token),
    )

    assert response.status_code == 400


def test_unauthenticated_cannot_create_dnd5e_character(client: TestClient):
    response = client.post("/characters/dnd5e", json=dnd5e_payload())

    assert response.status_code == 401


def test_authenticated_user_can_create_get_update_and_delete_dnd5e_character(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")

    created = create_dnd5e(client, token)

    assert created["rule_system"] == "dnd5e"
    assert created["name"] == "Mira"
    assert created["sheet"]["class_name"] == "Fighter"

    detail_response = client.get(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["sheet"]["level"] == 3

    update_response = client.put(
        f"/characters/dnd5e/{created['id']}",
        json={"name": "Updated Hero", "level": 4, "current_hp": 25},
        headers=auth_headers(token),
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["name"] == "Updated Hero"
    assert updated["sheet"]["level"] == 4
    assert updated["sheet"]["current_hp"] == 25

    delete_response = client.delete(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert delete_response.status_code == 204

    missing_response = client.get(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert missing_response.status_code == 404


def test_dnd5e_level_out_of_range_fails(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = dnd5e_payload()
    payload["level"] = 21

    response = client.post("/characters/dnd5e", json=payload, headers=auth_headers(token))

    assert response.status_code == 422


def test_dnd5e_ability_score_out_of_range_fails(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = dnd5e_payload()
    payload["strength"] = 31

    response = client.post("/characters/dnd5e", json=payload, headers=auth_headers(token))

    assert response.status_code == 422


def test_cannot_update_dnd5e_character_with_coc7_endpoint(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    created = create_dnd5e(client, token)

    response = client.put(
        f"/characters/coc7/{created['id']}",
        json={"occupation": "Wrong endpoint"},
        headers=auth_headers(token),
    )

    assert response.status_code == 400


def test_users_can_only_access_their_own_characters(client: TestClient):
    alice_token = register_and_login(client, "alice", "alice@example.com")
    bob_token = register_and_login(client, "bob", "bob@example.com")
    alice_character = create_coc7(client, alice_token, name="Alice Character")
    bob_character = create_dnd5e(client, bob_token, name="Bob Character")

    alice_list_response = client.get("/characters", headers=auth_headers(alice_token))
    bob_list_response = client.get("/characters", headers=auth_headers(bob_token))

    assert alice_list_response.status_code == 200
    assert [item["id"] for item in alice_list_response.json()] == [alice_character["id"]]
    assert bob_list_response.status_code == 200
    assert [item["id"] for item in bob_list_response.json()] == [bob_character["id"]]

    get_response = client.get(
        f"/characters/{alice_character['id']}",
        headers=auth_headers(bob_token),
    )
    assert get_response.status_code == 404

    update_response = client.put(
        f"/characters/coc7/{alice_character['id']}",
        json={"occupation": "Should fail"},
        headers=auth_headers(bob_token),
    )
    assert update_response.status_code == 404

    delete_response = client.delete(
        f"/characters/{alice_character['id']}",
        headers=auth_headers(bob_token),
    )
    assert delete_response.status_code == 404
