import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/edit_profile.css";

function EditProfile({ currentUser }) {

  // set form data
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: ""
  });
  // get token
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        firstName: currentUser.first_name || "",
        lastName: currentUser.last_name || "",
        email: currentUser.email || ""
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((data) => ({
      ...data,
      [name]: value
    }));
  };
  // use user id to patch 
  async function handleSubmit(e) {
    e.preventDefault();

    const response = await axios.patch(
      `http://localhost:5000/user/${currentUser.user_id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log(response.data);
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="formDiv">
        <h1 className="quintal">Edit Profile</h1>

        <form className="editForm" onSubmit={handleSubmit}>
          <label className="label" htmlFor="username">Username:</label>
          <input
            className="editInputs"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <label className="label" htmlFor="firstName">First Name:</label>
          <input
            className="editInputs"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <label className="label" htmlFor="lastName">Last Name:</label>
          <input
            className="editInputs"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <label className="label" htmlFor="email">email:</label>
          <input
            className="editInputs"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <button>Save</button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;



    

