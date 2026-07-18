import axios from "axios";

// makes get request to the bathrooms route in app.py
export async function getAllBathrooms(){
    
    try {
        const res = await axios.get('http://127.0.0.1:5000/bathrooms');
        return res.data;
        
      } catch (error) {
        console.error(error);
      }

}

