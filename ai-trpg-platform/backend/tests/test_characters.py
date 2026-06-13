import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.base import Base
from app.db.database import get_db
from app.main import app


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


def coc7_payload(name: str = "Dr. Armitage") -> dict:
    return {
        "name": name,
        "occupation": "Professor",
        "age": 42,
        "gender": "Unknown",
        "residence": "Arkham",
        "birthplace": "Boston",
        "background": "A brief original test background.",
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
        "mp": 13,
        "san": 65,
        "build": 0,
        "damage_bonus": "0",
        "move": 8,
        "skills_json": {"library_use": 60},
        "equipment_json": {"items": ["notebook"]},
        "backstory_json": {"notes": "test only"},
        "status_json": {"conditions": []},
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


def test_unauthenticated_cannot_create_coc7_character(client: TestClient):
    response = client.post("/characters/coc7", json=coc7_payload())

    assert response.status_code == 401


def test_authenticated_user_can_create_get_update_and_delete_coc7_character(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")

    created = create_coc7(client, token)

    assert created["rule_system"] == "coc7"
    assert created["name"] == "Dr. Armitage"
    assert created["sheet"]["occupation"] == "Professor"

    detail_response = client.get(
        f"/characters/{created['id']}",
        headers=auth_headers(token),
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["sheet"]["skills_json"]["library_use"] == 60

    update_response = client.put(
        f"/characters/coc7/{created['id']}",
        json={"name": "Updated Investigator", "occupation": "Archivist", "san": 60},
        headers=auth_headers(token),
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["name"] == "Updated Investigator"
    assert updated["sheet"]["occupation"] == "Archivist"
    assert updated["sheet"]["san"] == 60

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


def test_coc7_attribute_out_of_range_fails(client: TestClient):
    token = register_and_login(client, "alice", "alice@example.com")
    payload = coc7_payload()
    payload["str"] = 101

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
