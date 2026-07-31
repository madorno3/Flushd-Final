import React, {useEffect,useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/signup.css"

function Signup({registerData,setRegisterData}){

    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value} = e.target;
        // save register data from inputs
        setRegisterData((data) => ({
            ...data,
            [name]: value
        }));
    }
      
    async function handleSubmit(e){
        e.preventDefault();
        // make post request
        const response = await axios.post(
            "http://localhost:5000/signup",
            registerData
        );
        console.log(response.data);
        navigate("/login");
    }


    return (
        <div className="signupPage">
            
            <div className="formDiv">
            <h1 className="quintal">Sign up</h1>
            <form className="signupForm" onSubmit={handleSubmit}>
                <label className="label" htmlFor="username">Username:</label>
                <input type="text" name="username" id="username" className="registerInputs" value={registerData.username} onChange={handleChange} />
                <label className="label" htmlFor="firstName">First Name:</label>
                <input type="text" name="firstName" id="firstName" className="registerInputs" value={registerData.firstName} onChange={handleChange}  />
                <label className="label" htmlFor="lastName">Last Name:</label>
                <input type="text" name="lastName" id="lastName" className="registerInputs" value={registerData.lastName} onChange={handleChange} />
                <label className="label" htmlFor="email">email:</label>
                <input type="text" name="email" id="email" className="registerInputs" value={registerData.email} onChange={handleChange} />
                <label className="label" htmlFor="password">password:</label>
                <input type="text" name="password" id="password" className="registerInputs" value={registerData.password} onChange={handleChange} />
               
                <button className="blue-green-button">Sign Up!</button>
            </form>
        </div>
        </div>
    )
}

export default Signup; 