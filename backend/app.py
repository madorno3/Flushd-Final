import requests
from flask import Flask, jsonify, session, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import connect_db, db, Restrooms, Users, Reviews
from sqlalchemy import text
from dotenv import load_dotenv
load_dotenv()
from helpers.geocoding import convert_address
import os
from datetime import datetime, timezone
from flask_bcrypt import Bcrypt
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")




app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    "DATABASE_URL",
    "postgresql:///capstone2_db"
)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///capstone2_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

SECRET = "this-is-a-super-long-secret-key-1234567890"
app.config["SECRET_KEY"] = SECRET
app.config["JWT_SECRET_KEY"] = SECRET
app.config["JWT_TOKEN_LOCATION"] = ["headers"]

db.init_app(app)

jwt = JWTManager(app)

CORS(app, origins=["http://localhost:5173"])



@app.route('/')
def home():
    return jsonify({"message": "Hello from Flask backend!"})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    user = Users.register(
        first_name = data["firstName"],
        last_name = data["lastName"],
        email = data["email"],
        username = data["username"],
        password = data["password"]
    )
    db.session.commit()

    return jsonify({
        "message": "User created"
    })



@app.route("/login", methods=["POST"])
def login():
    
    data = request.json
    username = data["username"]
    password = data["password"]

    user = Users.authenticate(username, password)

    if user:
        access_token = create_access_token(identity=str(user.user_id))

        return jsonify({
            "message": "Login Success",
            "access_token": access_token,
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        })

    return jsonify({"message": "Login Failed"}), 401


@app.route("/me")
@jwt_required()
def get_me():

    user_id = int(get_jwt_identity())
    print("USER ID:", user_id)

    user = Users.query.get(user_id)

    return jsonify({
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    })

@app.route("/user/<int:user_id>", methods=['PATCH'])
@jwt_required()
def update_user(user_id):

    jwt_id = int(get_jwt_identity())

    print("JWT ID:", jwt_id, type(jwt_id))
    print("URL ID:", user_id, type(user_id))

    if jwt_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    
    user = Users.query.get_or_404(user_id)
    
    if "email" in data:
        user.email = data["email"]
    if "username" in data:
        user.username = data["username"]
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]

    db.session.commit()

    return jsonify({
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    })


# gets list of bathrooms from bathrooms api
@app.route('/bathrooms')
@jwt_required()
def get_bathrooms():

    res = requests.get("https://data.cityofnewyork.us/resource/i7jb-7jku.json")

    if res.status_code == 200:
        data = res.json()
        print("GET request successful!")
        print(f"Received {len(data)} items")

        # loops over the restrooms to only get the information I need 
        for restroom in data:
            facility_name = restroom.get("facility_name", "Unknown")
            latitude = restroom.get("latitude")
            longitude = restroom.get("longitude")
            hours_of_operation = restroom.get("hours_of_operation", "N/A")
            status = restroom.get("status", "N/A")
            changing_stations = restroom.get("changing_stations", "N/A")
            accessibility = restroom.get("accessibility", "N/A")
            additional_notes = restroom.get("additional_notes", "N/A")

            try:
                latitude = float(latitude) if latitude else None
                longitude = float(longitude) if longitude else None
            except ValueError:
                latitude = None
                longitude = None

            # checks to see if the bathrooms exists in database, if not it adds the bathroom
            existing = Restrooms.query.filter_by(restroom_name=facility_name,latitude=latitude,longitude=longitude).first()
            if not existing:
                bathroom = Restrooms(
                    restroom_name=facility_name,
                    latitude=latitude,
                    longitude=longitude,
                    hours_of_operation=hours_of_operation,
                    status=status,
                    changing_stations=changing_stations,
                    accessibility=accessibility,
                    additional_notes=additional_notes
                )
                db.session.add(bathroom)

       
        db.session.commit()
        print("All bathrooms added successfully!")
        print("my brain is SO FUCKING TIRED!!!")
        
        all_bathrooms = Restrooms.query.all()
        # print(all_bathrooms)
        return jsonify([{
            "restroom_name": b.restroom_name,
            "latitude": str(b.latitude),
            "longitude": str(b.longitude),
            "hours_of_operation": b.hours_of_operation,
            "status": b.status,
            "changing_stations": b.changing_stations,
            "accessibility": b.accessibility,
            "additional_notes": b.additional_notes
        } for b in all_bathrooms])

    
    return jsonify({"error": "Failed to fetch bathrooms"}), 500



# accepts closest location from userLocation.jsx and finds the 5 closest bathrooms
@app.route('/closest',methods=['POST'])
@jwt_required()
def closest_restrooms():

    
    print("ALL HEADERS:", dict(request.headers))
    data = request.get_json() 
    print("DATA:", data)
    print("RAW BODY:", request.data)
   
    latitude = data.get("latitude", "Unknown")
    longitude = data.get("longitude", "Unknown")
    point = f"SRID=4326;POINT({longitude} {latitude})"
    results = db.session.execute(text("""
    SELECT restroom_id, restroom_name, latitude, longitude, hours_of_operation, status,
           changing_stations, accessibility, additional_notes,
           ST_Distance(location, ST_GeogFromText(:point)) AS distance_meters
    FROM restrooms
    WHERE location IS NOT NULL
    ORDER BY location <-> ST_GeogFromText(:point) 
    LIMIT 5;
    """), {"point": point}).mappings().all()

    response = []
    # maps over results to get the coordinates of each bathroom
    for row in results:
        row_dict = dict(row)
        lat = row_dict["latitude"]
        lng = row_dict["longitude"]

        if not row_dict.get("address"):
            # if there is no address then use coordinates as parameters for(convert_address) and get the address
            row_dict["address"] = convert_address(lat, lng)
        # append the address to the response to send it to the front end
        response.append(row_dict)

    return jsonify(response)
    
@app.route('/bathrooms/directions',methods=['POST'])
@jwt_required()
def compute_route():


    data = request.json

    origin = data["origin"]
    destination = data["destination"]
    travel_mode = data.get("travelMode")
    
    headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": GOOGLE_API_KEY,
    "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs.steps"
    }

    body = {
    "origin": {
        "location": {
            "latLng": {
                "latitude": origin["lat"],
                "longitude": origin["lng"]
            }
        }
    },

    "destination": {
            "location": {
                "latLng": {
                    "latitude": destination["lat"],
                    "longitude": destination["lng"]
                }
            }
        },
        "travelMode": travel_mode

    }

    if travel_mode == "TRANSIT":
        body["departureTime"] = datetime.now(timezone.utc).isoformat()

    print("GOOGLE KEY:", GOOGLE_API_KEY[:8])
    res = requests.post("https://routes.googleapis.com/directions/v2:computeRoutes", headers=headers, json=body)
    print(res)

    return jsonify(res.json())

@app.route('/bathrooms/<int:restroom_id>/reviews',methods=['POST'])
@jwt_required()
def make_review(restroom_id):

    jwt_id = int(get_jwt_identity())

    data = request.json
    review = data["review"]
    rating=data.get("rating") or None
    user_id=int(get_jwt_identity())
    new_review = Reviews(user_id=user_id,restroom_id=restroom_id,review=review,rating=rating)
    db.session.add(new_review)
    db.session.commit()
    
    return {
    "review_id": new_review.review_id,
    "review": new_review.review,
    "rating": new_review.rating,
    "user_id": new_review.user_id
}

@app.route('/bathrooms/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):


    user_id = int(get_jwt_identity())
    
    comment = Reviews.query.filter_by(review_id=review_id).first()

    if not comment:
        return jsonify({"error": "Review not found"}), 404
    
    if comment.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Review deleted"})


# route to get reviews on db to display on chosenBathrooms component
@app.route('/bathrooms/<int:restroom_id>/reviews',methods=['GET'])
@jwt_required()
def get_review(restroom_id):


    reviews = Reviews.query.filter_by(restroom_id=restroom_id).all()

    print([
    {
        "username": r.user.username,
        "review": r.review
    }
    for r in reviews
])

    return {
    "reviews": [
        {
            "username": r.user.username,
            "review_id": r.review_id,
            "review": r.review,
            "rating": r.rating,
            "user_id": r.user_id
            
        }
        for r in reviews
    ]
}


if __name__ == "__main__":
    with app.app_context():
        app.run(debug=True)




