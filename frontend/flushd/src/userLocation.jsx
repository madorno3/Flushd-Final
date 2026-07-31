import React from "react";
import axios from "axios";

// uses current location as an input and makes post request to /closest route. 
// current location is a global variable in app.jsx
export async function UserLocation (currentLocation){
  try {
    const token = localStorage.getItem("access_token");
    console.log("TOKEN AT REQUEST TIME:", token);
    console.log("SENDING:", currentLocation);
    const res = await axios.post(
      'http://127.0.0.1:5000/closest', 
    currentLocation,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error(error);
    console.log("RESPONSE:", error.response);
    console.log("DATA:", error.response?.data);
  }

}
       
     