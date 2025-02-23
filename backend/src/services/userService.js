import AWS from "aws-sdk";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = "Users";

/**
 * Generate a JWT token for authentication.
 */
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

/**
 * Signup a new user and enforce unique email.
 */
export const signupUser = async ({ email, password, firstName, lastName, profilePicture }) => {
  if (!email || !password || !firstName || !lastName) {
    throw new Error("All fields are required.");
  }

  try {
    // Step 1: Check if email exists
    const params = {
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    const existingUser = await dynamoDB.query(params).promise();

    if (existingUser.Items.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    // Step 2: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Create new user
    const userId = uuidv4();
    const newUser = {
      userId,
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      profilePicture: profilePicture || null,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.put({ TableName: USERS_TABLE, Item: newUser }).promise();

    return { success: true, message: "User created successfully!" };
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Signup failed.");
  }
};

/**
 * Login an existing user.
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Missing email or password.");
  }

  try {
    const params = {
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    const data = await dynamoDB.query(params).promise();

    if (!data.Items || data.Items.length === 0) {
      throw new Error("Invalid email or password.");
    }

    const user = data.Items[0];

    // Step 2: Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Invalid email or password.");
    }

    // Step 3: Generate JWT token (with userId)
    const token = generateToken(user.userId);

    return { success: true, token };
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw new Error(error.message || "Login failed.");
  }
};

/**
 * Fetch a user by userId.
 */
export const getUser = async (userId) => {
  if (!userId) throw new Error("User ID is required.");

  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Error fetching user.");
  }
};