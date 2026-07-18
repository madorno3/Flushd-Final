import React, {useEffect,useState,FunctionComponent} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserLocation } from "./userLocation";
import { getAllBathrooms } from "./get_all_bathrooms";
import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
import "./css/bathrooms.css";



function BathroomList({currentLocation,closestData, setClosestData}){

    const [allBathroomData, setAllBathroomData] = useState();
    console.log(currentLocation);
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();
    
    
    // runs UserLocation once clicked
    async function handleClick(){
        try{
            const data = await UserLocation(currentLocation);
            setClosestData(data);
        console.log("clicked");

        } catch (err){
            console.log(err);
        } finally {
            setLoading(false);
        }
        
    }

    return(
        <div className="containerDiv">
            
            <div id="intro">
                <h1 className="searchTxt">Find me a </h1>
                <h1 className="searchTxt"> porcelain throne</h1>
                <h1 className="searchTxt"> now!</h1>
            </div>
            <button className="search" onClick={handleClick}>Search</button>

            {loading && <p>Loading...</p>}

            <div id="map-container">
                
                {currentLocation.latitude && closestData?.length > 0 && (
                <Map
                    zoom={14}
                    center={{
                    lat: Number(currentLocation.latitude),
                    lng: Number(currentLocation.longitude),
                    }}
                    style={{ width: "100%", height: "400px" }}>

                    {closestData.map((bathroom) => (
                        
                    <Marker
                        key={bathroom.restroom_id}
                        position={{
                        lat: Number(bathroom.latitude),
                        lng: Number(bathroom.longitude),
                        
                        }}
                        
                        onClick={() => navigate(`/bathrooms/${bathroom.restroom_id}`)}
                    
                    />
                    
                    ))}
                </Map>

                    )}


            </div>
            
            
            <div id="br-list-container">
                <ol>
                    {closestData?.map((bathroom) => (
                    <li key={bathroom.restroom_id} className="bathroom-card">
                        <Link to={`/bathrooms/${bathroom.restroom_id}`}>
                        <h2 className="h2-color">{bathroom.restroom_name}</h2>

                        <ul className="bathroom-card">
                            <li className="li-color">📍 {bathroom.address}</li>
                            <li className="li-color">📏 {bathroom.distance_meters} m away</li>
                            <li className="li-color">🕒 Hours: {bathroom.hours_of_operation}</li>
                            <li className="li-color">🚦 Status: {bathroom.status}</li>
                            <li className="li-color">👩🏽‍🍼 Changing Station: {bathroom.changing_stations}</li>
                            <li className="li-color">♿ Accessibility: {bathroom.accessibility}</li>
                            <li className="li-color">📝 Notes: {bathroom.additional_notes}</li>
                        </ul>
                        </Link>
                    </li>
                    ))}
                </ol>
            </div>

            
    </div>   

    )

}

export default BathroomList;
