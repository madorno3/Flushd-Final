import requests;
import os;

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# function to convert coordinates to addresses. 
# used in /closest route as: address = convert_address(lat, lng)
def convert_address(latitude, longitude):
    try:
        res = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"latlng": f"{latitude},{longitude}", "key": GOOGLE_API_KEY}
        )
        data = res.json()
        if data["results"]:
            return data["results"][0]["formatted_address"]
        
    except Exception as e:
        print("Geocoding error:", e)
    return None