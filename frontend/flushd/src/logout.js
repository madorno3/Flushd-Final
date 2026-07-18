import { useNavigate } from "react-router-dom";

export function useLogout(setLoginData) {
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem("access_token");

    setLoginData({
      username: "",
      password: ""
    });

    navigate("/entry"); 
  };
}