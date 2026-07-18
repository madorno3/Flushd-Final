import React from "react";
import axios from "axios";

export async function fetchRoute(
    currentLatitude,
    currentLongitude,
    destinationLatitude,
    destinationLongitude,
    travelMode
  ) {
    try {
      const token = localStorage.getItem("access_token");
      // make post request using coordinates from chosenBathroom.jsx
      const res = await axios.post(
        "http://127.0.0.1:5000/bathrooms/directions",
        {
          origin: {
            lat: currentLatitude,
            lng: currentLongitude,
          },
          destination: {
            lat: destinationLatitude,
            lng: destinationLongitude,
          },
          travelMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return res.data;
    } catch (error) {
      console.error(error);
    }
  }

