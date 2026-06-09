import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models.user import User


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


def register_user(client: TestClient, username: str = "alice", email: str = "alice@example.com"):
    return client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "secret123",
        },
    )


def test_register_user_success(client: TestClient):
    response = register_user(client)

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert data["role"] == "player"
    assert "password_hash" not in data


def test_register_duplicate_email_fails(client: TestClient):
    register_user(client)
    response = register_user(client, username="alice2", email="alice@example.com")

    assert response.status_code == 400


def test_register_duplicate_username_fails(client: TestClient):
    register_user(client)
    response = register_user(client, username="alice", email="alice2@example.com")

    assert response.status_code == 400


def test_login_success_returns_access_token(client: TestClient):
    register_user(client)
    response = client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "secret123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"


def test_login_wrong_password_fails(client: TestClient):
    register_user(client)
    response = client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "wrong123"},
    )

    assert response.status_code == 401


def test_auth_me_without_token_fails(client: TestClient):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_with_token_succeeds(client: TestClient):
    register_user(client)
    login_response = client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "secret123"},
    )
    token = login_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "password_hash" not in data
