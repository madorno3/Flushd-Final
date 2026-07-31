from app import app,db
from unittest import TestCase
from flask import session
import pytest 
from models import Users,Restrooms, Reviews
from unittest.mock import patch

app.config['TESTING'] = True

@pytest.fixture
def client():
    app.config["TESTING"] = True

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

# Test getting directions between two points.
def test_compute_route(client, test_user_token):
    

    mock_response = {
        "routes": [
            {
                "distanceMeters": 1200,
                "duration": "300s",
                "polyline": {
                    "encodedPolyline": "abcd1234"
                },
                "legs": [
                    {
                        "steps": []
                    }
                ]
            }
        ]
    }

    with patch("app.requests.post") as mock_post:
        mock_post.return_value.json.return_value = mock_response

        resp = client.post(
            "/bathrooms/directions",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "origin": {
                    "lat": 40.7128,
                    "lng": -74.0060
                },
                "destination": {
                    "lat": 40.7306,
                    "lng": -73.9352
                },
                "travelMode": "WALK"
            }
        )

    assert resp.status_code == 200

    data = resp.get_json()

    assert data["routes"][0]["distanceMeters"] == 1200
    assert data["routes"][0]["duration"] == "300s"
    assert data["routes"][0]["polyline"]["encodedPolyline"] == "abcd1234"

    mock_post.assert_called_once()

# testing if a user is signed in in order to make a review
def test_make_review_auth(client):

    resp = client.post(
        "/bathrooms/1/reviews",
        json={
            "review": "Nice bathroom",
            "rating": 5
        }
    )

    assert resp.status_code == 401

# test leaving a review for a restroom: 
def test_make_review(client, test_user_token):
    
    # Get an existing restroom
    restroom = Restrooms.query.first()

    resp = client.post(
        f"/bathrooms/{restroom.restroom_id}/reviews",
        headers={
            "Authorization": f"Bearer {test_user_token}"
        },
        json={
            "review": "Clean bathroom and well maintained.",
            "rating": 5
        }
    )

    assert resp.status_code == 200

    data = resp.get_json()

    assert "review_id" in data
    assert data["review"] == "Clean bathroom and well maintained."
    assert data["rating"] == 5
    assert "user_id" in data
