import axios from "axios";
import { getRefreshedToken, isAccessTokenExpired, setAuthUser } from "./auth";
import { API_BASE_URL } from "./constants";
import { getCSRFToken } from "../../../backend/utils/csrf"; 
import Cookies from "js-cookie";

// const getCSRFToken = () => {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== "") {
//     const cookies = document.cookie.split(";");
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, 10) === "csrftoken=") {
//         cookieValue = decodeURIComponent(cookie.substring(10));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// };

const useAxios = () => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");
  const csrfToken = getCSRFToken(); 
  //console.log("accessToken", accessToken)

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    if (!isAccessTokenExpired(accessToken)) {
      return req;
    }
     //   console.log("Token is expired, refreshing...");
        const response = await getRefreshedToken(refreshToken);
     //   console.log("New Token:", response.access);

        setAuthUser(response.access, response.refresh);
        req.headers.Authorization = `Bearer ${response.access}`;
    return req;
  });

  return axiosInstance;
};

export default useAxios;
