import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRoute } from "./route";
import "./css/chosenBathroom.css";
import axios from "axios";
import {APIProvider, Map, Marker, Polyline} from '@vis.gl/react-google-maps';
import { decode } from "@googlemaps/polyline-codec";



function parseJwt(token) {
  return JSON.parse(atob(token.split(".")[1]));
}

function ChosenBathroom({ closestData, currentLocation }) {
  const { restroom_id } = useParams();
  const [routeData, setRouteData] = useState(null);
  const [travelMode, setTravelMode] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    review: "",
    rating: "1"
  });
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem("access_token");
  const userId = token ? parseJwt(token).sub : null;
  const [routePath, setRoutePath] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  // Make sure closestData exists before finding the bathroom
  const bathroom = closestData
    ? closestData.find((b) => b.restroom_id === Number(restroom_id))
    : null;

  console.log("Bathroom:", bathroom);
  console.log("CurrentLocation:", currentLocation);

  // Fetch route when bathroom, currentLocation, and travelMode are all ready
  useEffect(() => {
    async function getRoute() {
      if (!bathroom || !currentLocation || !travelMode) return;

      console.log("Calling fetchRoute with mode:", travelMode);

      const data = await fetchRoute(
        Number(currentLocation.latitude),
        Number(currentLocation.longitude),
        Number(bathroom.latitude),
        Number(bathroom.longitude),
        travelMode
      );

      console.log("Route data received:", data);
      setRouteData(data);
    }

    getRoute();
  }, [bathroom, currentLocation, travelMode]);

  // decode polyline
  useEffect(() => {
    if (!routeData) return;
  
    const encoded =
      routeData?.routes?.[0]?.polyline?.encodedPolyline;
  
    if (!encoded) return;
  
    const decoded = decode(encoded).map(([lat, lng]) => ({
      lat,
      lng,
    }));
  
    setRoutePath(decoded);
  }, [routeData]);

  // makes call to back end to get reviews from db
  async function getReviews() {
    const token = localStorage.getItem("access_token");

    const response = await axios.get(
      `http://localhost:5000/bathrooms/${restroom_id}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("REVIEWS RAW:", response.data);
    setReviews(response.data.reviews);
    
  }

  useEffect(() => {
    getReviews();
  }, [restroom_id]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((data) => ({
        ...data,
        [name]: value
    }));
}

  // makes call to back end to post review. 
  
    async function postReview(){
      try{
        const token = localStorage.getItem("access_token");

        console.log("TOKEN:", token);

        const response = await axios.post(`http://localhost:5000/bathrooms/${restroom_id}/reviews`,
        {
          review: formData.review,
          rating: formData.rating
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Review created:", response.data);
        // get reviews
      await getReviews();

      setFormData({
        review: "",
        rating: ""
      });
  
      setShowForm(false);

      } catch(error){
        console.log("RESPONSE:", error.response);
        console.log("DATA:", error.response?.data);
        console.error(error)
      }
      
    }

    async function deleteReview(review_id){
      try{
        const response = await axios.delete(
          `http://localhost:5000/bathrooms/reviews/${review_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
    
        console.log("Review deleted", response.data);
        await getReviews();

      } catch(error){
        console.error(error)
      }
    }

    return (
      <div className="containerDiv">
        {!bathroom || !currentLocation ? (
          <p>Loading bathroom data...</p>
        ) : (
          <>
            <div className="br-li-container">
              <h2 className="h2-color">{bathroom.restroom_name}</h2>
              <p>Status: {bathroom.status}</p>
              <p>Address: 📍{bathroom.address}</p>
              <p>Hours: 🕒{bathroom.hours_of_operation}</p>
              <p>Distance: 📏 {bathroom.distance_meters} m away</p>
              <p>👩🏽‍🍼 Changing Station: {bathroom.changing_stations}</p>
              <p>♿ Accessibility: {bathroom.accessibility}</p>
              <p>📝 Notes: {bathroom.additional_notes}</p>
            </div>
    
            <Map
              zoom={routeData ? 15 : 12}
              center={{
                lat: Number(currentLocation.latitude),
                lng: Number(currentLocation.longitude),
              }}
              style={{ width: "100%", height: "400px" }}
            >
              <Marker
                position={{
                  lat: Number(currentLocation.latitude),
                  lng: Number(currentLocation.longitude),
                }}
              />
    
              {bathroom && (
                <Marker
                  position={{
                    lat: Number(bathroom.latitude),
                    lng: Number(bathroom.longitude),
                  }}
                />
              )}
    
              {routePath.length > 0 && (
                <Polyline
                  path={routePath}
                  strokeColor="#2563eb"
                  strokeWeight={5}
                />
              )}
            </Map>
    
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={() => {
                  setTravelMode("WALK");
                  setShowDirections(true);
                }}
              >
                🚶🏽‍♀️ Walk
              </button>
    
              <button
                onClick={() => {
                  setTravelMode("DRIVE");
                  setShowDirections(true);
                }}
              >
                🚗 Drive
              </button>
    
              <button
                onClick={() => {
                  setTravelMode("BICYCLE");
                  setShowDirections(true);
                }}
              >
                🚲 Bike
              </button>
            </div>
    
            <div className="details-container">
            {reviews.length > 0 && (
              <div id="bathroom_reviews_div">
                <h2>Reviews</h2>

                {reviews.map((review) => (
                  <div key={review.review_id}>
                    <p className="username"><b>{review.username}</b></p>
                    <p>{review.review}</p>
                    <p>Rating: {review.rating}</p>

                    {review.user_id === Number(userId) && (
                      <button onClick={() => deleteReview(review.review_id)}>
                        Delete Review
                      </button>
                    )}
                  </div>
                ))}

              </div>
            )}

            {showDirections && (
              <div className="directionsDiv">
                <h2>Directions</h2>

                {routeData?.routes?.[0]?.legs?.[0]?.steps && (
                  <ol>
                    {routeData.routes[0].legs[0].steps.map((step, index) => (
                      <li key={index}>
                        {step.navigationInstruction.instructions}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            </div>
            
    
            <form
              id="comment-form"
              className={showForm ? "" : "hidden"}
              onSubmit={(e) => {
                e.preventDefault();
                postReview();
              }}
            >
              <label htmlFor="review">Leave a review</label>
    
              <input
                name="review"
                value={formData.review}
                onChange={handleChange}
              />
    
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              >
                <option value="1">1 toilet 🚽</option>
                <option value="2">2 toilets 🚽🚽</option>
                <option value="3">3 toilets 🚽🚽🚽</option>
                <option value="4">4 toilets 🚽🚽🚽🚽</option>
                <option value="5">5 toilets 🚽🚽🚽🚽🚽</option>
              </select>
    
              <button type="submit">Submit</button>
            </form>
    
            <button
              id="postReview-btn"
              onClick={() => setShowForm(!showForm)}
            >
              Post Review
            </button>
          </>
        )}
      </div>
    );
    }

    export default ChosenBathroom;
 
