import React, {useEffect,useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/entry.css"
import toilet from "./pics/toilet.png"

function Entry(){
    return (
        <div id="container">
            <div id="entry-header">
                <div className="title-container">
                    <h1 className="flushed_h1">Flush'd</h1>
                    <img id="toilet_pic" src={toilet} alt="toilet" />
                </div>

                <div className="buttons-container">
                    <Link to={`/signup`}>
                        <button className="button">Sign Up</button>
                    </Link>
                    <Link to={`/login`}>
                        <button className="button">Login</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Entry; 