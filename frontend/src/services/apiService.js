import axios from "axios";

const API_BASE_URL = "https://o51nguwhcd.execute-api.us-west-2.amazonaws.com/dev"; // Ensure this is the correct API Gateway URL

/**
 * Create a reusable Axios instance with proper CORS handling.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false // AWS API Gateway does not require credentials in most cases
});

/**
 * Attach Authorization token to every request if available.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Helper function to handle errors.
 */
const handleApiError = (error, action = "performing the request") => {
  if (error.response) {
    console.error(`Error ${action}:`, error.response.data);
    throw new Error(error.response.data.message || `Error ${action}`);
  } else if (error.request) {
    console.error(`No response received while ${action}:`, error.request);
    throw new Error(`No response from server while ${action}`);
  } else {
    console.error(`Request setup error while ${action}:`, error.message);
    throw new Error(`Unexpected error while ${action}`);
  }
};

/**
 * Fetch user by ID from the backend API.
 */
export const getUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "fetching user");
  }
};

/**
 * Create a new user by sending data to the backend API.
 */
export const createUser = async (user) => {
  if (!user?.email || !user?.password || !user?.firstName || !user?.lastName) {
    throw new Error("Invalid user data. Ensure all required fields are provided.");
  }

  try {
    const response = await axiosInstance.post("/users/signup", user);
    return response.data;
  } catch (error) {
    handleApiError(error, "creating user");
  }
};

/**
 * Log in a user and store the JWT token in localStorage.
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  try {
    const response = await axiosInstance.post("/users/login", { email, password });

    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || "Invalid login credentials.");
    }
  } catch (error) {
    handleApiError(error, "logging in");
  }
};

/**
 * Log out the user by removing the JWT token.
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
};

/**
 * Get the authenticated user token from localStorage.
 */
export const getAuthenticatedUser = () => {
  const token = localStorage.getItem("token");
  return token ? { isAuthenticated: true, token } : { isAuthenticated: false };
};

/**
 * Fetch all customers from the backend API.
 */
export const getCustomers = async () => {
  try {
    const response = await axiosInstance.get("/customers");
    return response.data.customers;
  } catch (error) {
    handleApiError(error, "fetching customers");
  }
};

/**
 * Create a new customer by sending data to the backend API.
 */
export const createCustomer = async (customer) => {
  if (!customer?.name || !customer?.email || !customer?.phone) {
    throw new Error("Invalid customer data. Ensure name, email, and phone are provided.");
  }

  try {
    const response = await axiosInstance.post("/customers", customer);
    return response.data;
  } catch (error) {
    handleApiError(error, "creating customer");
  }
};