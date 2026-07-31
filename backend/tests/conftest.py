import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "postgresql:///flushd_test"

from app import app, db
from models import Users, Reviews
import pytest

app.config["TESTING"] = True


@pytest.fixture
def client():
    with app.app_context():
        Reviews.query.delete()
        Users.query.delete()
        db.session.commit()

    with app.test_client() as client:
        yield client

    with app.app_context():
        Reviews.query.delete()
        Users.query.delete()
        db.session.commit()


@pytest.fixture
def test_user_token(client):
    client.post(
        "/signup",
        json={
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123"
        }
    )

    login = client.post(
        "/login",
        json={
            "username": "testuser",
            "password": "password123"
        }
    )

    return login.get_json()["access_token"]