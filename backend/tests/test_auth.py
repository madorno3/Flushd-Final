from app import app,db
from unittest import TestCase
from flask import session
import pytest 
from models import Users,Restrooms
app.config['TESTING'] = True

@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.app_context():
        Users.query.delete()
        db.session.commit()

    with app.test_client() as client:
        yield client

    with app.app_context():
        Users.query.delete()
        db.session.commit()


# tests post request
def test_login_form(client):
        
        # Test registering
        client.post(
            '/signup',
            json={
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john2@example.com',
                'username': 'johndoe2',
                'password': 'password123'
            }
        )

        # Tests Logging in
        resp = client.post(
            '/login',
            json={
                'username': 'johndoe2',
                'password': 'password123'
            }
        )

        assert resp.status_code == 200

        data = resp.get_json()

        assert data["message"] == "Login Success"
        assert "access_token" in data
        assert data["user"]["username"] == "johndoe2"


# tests 5 closest bathrooms
def test_get_bathrooms(client):

    # Register
    client.post(
        "/signup",
        json={
            "firstName": "Bathroom",
            "lastName": "Tester",
            "email": "bathroom@example.com",
            "username": "bathroom_test",
            "password": "password123"
        }
    )

    # Login
    login_resp = client.post(
        "/login",
        json={
            "username": "bathroom_test",
            "password": "password123"
        }
    )

    assert login_resp.status_code == 200

    token = login_resp.get_json()["access_token"]

    # Call protected endpoint
    resp = client.get(
        "/bathrooms",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert resp.status_code == 200

    data = resp.get_json()

    assert isinstance(data, list)
    assert len(data) > 0

    first = data[0]

    assert "restroom_name" in first
    assert "latitude" in first
    assert "longitude" in first
    assert "status" in first