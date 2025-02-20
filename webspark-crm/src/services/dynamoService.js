import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const API_URL = "https://vksxvoy6dk.execute-api.us-west-2.amazonaws.com/dev";

const client = new DynamoDBClient({ region: "us-west-2" });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
  unmarshallOptions: { wrapNumbers: false },
});

const TABLE_NAME = "Users"; 

// ========================
// ✅ API-Based Functions
// ========================

// ** Create User Function (API) **
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

// ** Login User Function (API) **
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

// ** Logout User Function (API) **
export const logoutUser = () => {
  localStorage.removeItem("token"); // Remove JWT token from localStorage
};

// ** Get Authenticated User Function (API) **
export const getAuthenticatedUser = () => {
  const token = localStorage.getItem("token");
  return token ? { isAuthenticated: true, token } : { isAuthenticated: false };
};

// ========================
// ✅ DynamoDB-Based Functions
// ========================

// ** Fetch User from DynamoDB **
export const getUserFromDB = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: userId },
  };

  try {
    const data = await docClient.send(new GetCommand(params));
    return data.Item || null;
  } catch (error) {
    console.error("Error fetching user from DynamoDB:", error);
    throw error;
  }
};

// ** Create User in DynamoDB **
export const saveUserToDB = async (user) => {
  const params = {
    TableName: TABLE_NAME,
    Item: user,
  };

  try {
    await docClient.send(new PutCommand(params));
    return { success: true, message: "User saved successfully." };
  } catch (error) {
    console.error("Error saving user to DynamoDB:", error);
    return { success: false, message: "Error saving user." };
  }
};
