import React, {useEffect,useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/signup.css"

function Login({loginData,setLoginData,currentUser,setCurrentUser}){

    const navigate = useNavigate();

    // get data from inputs and save in variable
    const handleChange = (e) => {
        const {name, value} = e.target;
        setLoginData((data) => ({
            ...data,
            [name]: value
        }));
    }
      
    async function handleSubmit(e){
        e.preventDefault();
        // use loginData to make post request
        try {
            const response = await axios.post(
                "http://localhost:5000/login",
                loginData
            );
            console.log(response.data);
            // back end sends back authenticated user and user is updated in setCurrentUser
            setCurrentUser(response.data.user);
            console.log(`CURRENT USER IS: ${currentUser}`)
            localStorage.setItem("access_token", response.data.access_token);
            alert("Login successful");

        } catch (error){
            console.error(error)
        }

        navigate("/home");
        
    }


    return(
        <div className="signupPage">
            <div className="formDiv">
                <h1 className="quintal">Login</h1>
                <form className="signupForm" onSubmit={handleSubmit}>
                    <label className="label" htmlFor="username">Username:</label>
                    <input name="username" className="registerInputs" value={loginData.username} onChange={handleChange} />
                    <label className="label" htmlFor="password">Password:</label>
                    <input name="password" className="registerInputs" value={loginData.password} onChange={handleChange} />
                    <button>Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login;