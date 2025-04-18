import axios from "axios";

const API_BASE_URL = "https://o51nguwhcd.execute-api.us-west-2.amazonaws.com/dev";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false
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
    const {...customerData } = customer;
    
    const response = await axiosInstance.post("/customers", customerData);
    return response.data;
  } catch (error) {
    handleApiError(error, "creating customer");
  }
};

/**
 * Fetch a single customer by ID.
 */
export const getCustomerById = async (customerId) => {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    const response = await axiosInstance.get(`/customers/${customerId}`);
    return response.data.customer;
  } catch (error) {
    handleApiError(error, "fetching customer details");
  }
};

/**
 * Update customer information.
 */
export const updateCustomer = async (customerId, updates) => {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    // Remove profile picture handling to avoid size issues
    // eslint-disable-next-line no-unused-vars
    const { profilePicture, _profilePictureFile, ...updateData } = updates;
    
    const response = await axiosInstance.put(`/customers/${customerId}`, updateData);
    return response.data;
  } catch (error) {
    handleApiError(error, "updating customer");
  }
};

/**
 * Update customer tasks.
 */
export const updateTasks = async (customerId, tasks) => {
  if (!customerId) throw new Error("Customer ID is required");
  if (!Array.isArray(tasks)) throw new Error("Tasks must be an array");

  try {
    const response = await axiosInstance.put(`/customers/${customerId}/tasks`, tasks);
    return response.data;
  } catch (error) {
    handleApiError(error, "updating tasks");
  }
};

/**
 * Update customer notes.
 */
export const updateNotes = async (customerId, notes) => {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    // If notes is not a string, convert it
    const notesStr = typeof notes === 'string' ? notes : String(notes);
    
    console.log(`Sending notes update for customer ${customerId}:`, notesStr);
    
    // Send a simple object with the notes string
    const response = await axiosInstance.put(`/customers/${customerId}/notes`, { notes: notesStr });
    return response.data;
  } catch (error) {
    return handleApiError(error, "updating notes");
  }
};

/**
 * Update assigned users for a customer.
 */
export const updateAssignedUsers = async (customerId, assignedUsers) => {
  if (!customerId) throw new Error("Customer ID is required");
  if (!Array.isArray(assignedUsers)) throw new Error("Assigned users must be an array");

  try {
    const response = await axiosInstance.put(`/customers/${customerId}/users`, assignedUsers);
    return response.data;
  } catch (error) {
    handleApiError(error, "updating assigned users");
  }
};

/**
 * Delete a customer.
 */
export const deleteCustomer = async (customerId) => {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    const response = await axiosInstance.delete(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "deleting customer");
  }
};

export const uploadUserProfilePicture = async (userId, base64Image) => {
  if (!userId || !base64Image) {
    throw new Error("User ID and profile picture are required");
  }

  try {
    console.log(`Attempting to upload profile picture for user: ${userId}`);
    
    // Send base64 image instead of FormData
    const response = await axiosInstance.post(`/users/${userId}/profile-picture`, {
      profilePicture: base64Image
    });
    
    console.log("Profile picture upload response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 413) {
      console.error("Payload too large. Image needs to be smaller.");
      throw new Error("Image is too large. Please use a smaller image.");
    }
    return handleApiError(error, "uploading profile picture");
  }
};

export const uploadCustomerProfilePicture = async (customerId, base64Image) => {
  if (!customerId || !base64Image) {
    console.error("Missing required data:", { 
      hasCustomerId: !!customerId, 
      hasImage: !!base64Image,
      imageLength: base64Image ? base64Image.length : 0 
    });
    throw new Error("Customer ID and profile picture are required");
  }

  try {
    console.log(`Attempting to upload profile picture for customer: ${customerId}`);
    console.log(`Base64 image length: ${base64Image.length}`);
    console.log(`Base64 image starts with: ${base64Image.substring(0, 50)}...`);
    
    // Send base64 image instead of FormData
    const response = await axiosInstance.post(`/customers/${customerId}/profile-picture`, {
      profilePicture: base64Image
    });
    
    console.log("Profile picture upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading customer profile picture:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    
    if (error.response && error.response.status === 413) {
      console.error("Payload too large. Image needs to be smaller.");
      throw new Error("Image is too large. Please use a smaller image.");
    }
    return handleApiError(error, "uploading customer profile picture");
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/users");
    return response.data.users;
  } catch (error) {
    handleApiError(error, "fetching all users");
  }
};