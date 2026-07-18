import { useEffect, useState } from 'react'
import axios from "axios";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BathroomList from './bathrooms.jsx';
import Entry from './entry.jsx';
import Signup from './signup.jsx';
import Login from './login.jsx';
import EditProfile from './edit_profile.jsx';
import Home from './home.jsx'
import Logout from './logout.jsx'
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import ChosenBathroom from './chosenBathroom.jsx';
import { APIProvider } from '@vis.gl/react-google-maps';
import Layout from "./Layout";
import Header from './header.jsx';
import MainLayout from './MainLayout.jsx';

import.meta.env.VITE_GOOGLE_API_KEY

function App() {
  const [currentLocation, setCurrentLocation] = useState({});
  const [registerData, setRegisterData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });


  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [currentUser, setCurrentUser] = useState(null);

  const [chosenData, setChosenData] = useState();

  const [closestData, setClosestData] = useState();


// get users current location
  const getLocation = () =>{
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      const { latitude, longitude} = position.coords;
      // set users location
      setCurrentLocation({latitude,longitude});
    });
  }

  useEffect(() => {
    getLocation()
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
  
    if (!token) return;
  
    axios.get("http://localhost:5000/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setCurrentUser(res.data);
    })
    .catch(err => {
      console.log("FULL ERROR:", err);
      console.log("MESSAGE:", err.message);
      console.log("RESPONSE:", err.response);
    });
  
  }, []);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <BrowserRouter>

        <Routes>
        {/* pages without header */}
          <Route path="/" element={<Entry />} />
          <Route path="/signup" element={<Signup registerData={registerData} setRegisterData={setRegisterData} />} />
          <Route path="/login" element={<Login loginData={loginData} setLoginData={setLoginData} setCurrentUser={setCurrentUser} />} />
  
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
  
            <Route
              path="/edit-profile"
              element={<EditProfile setCurrentUser={setCurrentUser} currentUser={currentUser} />}
            />
  
            <Route
              path="/bathrooms"
              element={
                <BathroomList
                  currentLocation={currentLocation}
                  closestData={closestData}
                  setClosestData={setClosestData}
                />
              }
            />
  
            <Route
              path="/bathrooms/:restroom_id"
              element={
                <>
                  <ChosenBathroom
                    closestData={closestData}
                    currentLocation={currentLocation}
                  />
                  <Logout loginData={loginData} setLoginData={setLoginData} />
                </>
              }
            />
          </Route>
  
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App
