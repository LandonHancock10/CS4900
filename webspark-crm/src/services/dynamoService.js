import axios from "axios";

const API_URL = "https://vksxvoy6dk.execute-api.us-west-2.amazonaws.com/dev";

// ** Create User Function **
export const createUser = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, user);

    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message || "Error creating user." };
    }
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    return { success: false, message: "Error creating user." };
  }
};

// ** Login User Function **
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data.success) {
      localStorage.setItem("token", response.data.token); // Store JWT token in localStorage
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message || "Invalid login credentials." };
    }
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    return { success: false, message: "Error logging in." };
  }
};

// ** Logout User Function **
export const logoutUser = () => {
  localStorage.removeItem("token"); // Remove JWT token from localStorage
};

// ** Get Authenticated User Function **
export const getAuthenticatedUser = () => {
  const token = localStorage.getItem("token");
  return token ? { isAuthenticated: true, token } : { isAuthenticated: false };
};