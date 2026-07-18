import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Logout({setLoginData,loginData}){
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setLoginData({
            username: "",
            password: ""
        });
      
        navigate("/login");
    }
    return (
        <button onClick={handleLogout}>
          Logout
        </button>
      );
}

export default Logout