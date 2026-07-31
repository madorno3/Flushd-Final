import React, {useEffect,useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/home.css";
import toilet from "./pics/toilet.png";
import map from "./pics/map.png";
import Header from "./header";


function Home(){
    return (
        <div id="container">
           
            <div className="content-container">
                <div id="intro">

                <p id="where"> Where to go 
                        <br></br>
                        when you're 
                        <br></br>
                        on the go...
                </p>
                    
                </div>
                
                <div id="blob-div">
                    
                        <div id="blob"></div>
                    <Link to="/bathrooms">
                        <div className="blob-content">
                            <h2 id="h2-headline"><i>Find a free public restroom near you</i></h2>
                            <img id="map" src={map} alt="icon of a map"></img>
                        </div>
                    </Link>
                    
                </div>
                
                
            </div>
            
        </div>

    )
}

export default Home;