import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";

export const login = async (email, password) => {
  //console.log("check", email, password)
  try {
    const { data, status } = await axios.post(`user/token/`, {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }

    return { access: data.access, refresh: data.refresh, error: null };
  } catch (error) {
    return {
      access: null,
      refresh: null,
      error: error.response.data?.detail || "Something went wrong",
    };
  }
};

export const register = async (full_name, email, password, password2) => {
  try {
    const { data } = await axios.post(`user/register/`, {
      full_name,
      email,
      password,
      password2,
    });

    await login(email, password);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        `${error.response.data.full_name} - ${error.response.data.email}` ||
        "Something went wrong",
    };
  }
};

export const logout = (navigate) => {
  Cookie.remove("access_token");
  Cookie.remove("refresh_token");
  localStorage.removeItem("authToken");
  const authStore = useAuthStore.getState();
  authStore.setUser(null);
  navigate("/login");
};

export const setUser = async () => {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (!access_token || !refresh_token) {
    // alert("Tokens does not exists");
    return;
  }

  if (isAccessTokenExpired(access_token)) {
    const response = getRefreshedToken(refresh_token);
    if (response && response.access) {
      setAuthUser(response.access, response.refresh);
    } else {
      logout();
    }
  } else {
    setAuthUser(access_token, refresh_token);
  }
};

export const setAuthUser = (access_token, refresh_token) => {
  Cookie.set("access_token", access_token, {
    expires: 1,
    secure: true,
  });

  Cookie.set("refresh_token", refresh_token, {
    expires: 7,
    secure: true,
  });

  const user = jwt_decode(access_token) ?? null;

  if (user) {
    useAuthStore.getState().setUser(user);
  }
  useAuthStore.getState().setLoading(false);
};

export const getRefreshedToken = async () => {
  const refresh_token = Cookie.get("refresh_token");
  const response = await axios.post(`user/token/refresh/`, {
    refresh: refresh_token,
  });
  return response.data;
};

export const isAccessTokenExpired = (access_token) => {
  //console.log("access_token", access_token)
  try {
    const decodedToken = jwt_decode(access_token);
    // Add a small buffer (e.g., 30 seconds) to avoid issues with almost-expired tokens
    const bufferTime = 30;
    return decodedToken.exp < Date.now() / 1000 + bufferTime;
  } catch (error) {
    console.log("Error decoding token:", error);
    return true; // If there's an error decoding the token, consider it expired
  }
};