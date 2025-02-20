import AWS from "aws-sdk";
import bcrypt from "bcrypt-nodejs";
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
 * Middleware to parse AWS Lambda event body
 */
export const parseLambdaEventBody = (req, res, next) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString("utf8"));
    } else if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request body format." });
  }
  next();
};

/**
 * Signup a new user and store in DynamoDB.
 */
export const signupUser = async ({ email, password, firstName, lastName, profilePicture }) => {
  if (!email || !password || !firstName || !lastName) {
    throw new Error("All fields are required.");
  }

  if (typeof password !== "string") {
    throw new Error("Password must be a string.");
  }

  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: uuidv4(),
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      profilePicture: profilePicture || null,
    },
  };

  await dynamoDB.put(params).promise();
  return { success: true, message: "User created successfully!" };
};

/**
 * Login an existing user and return a JWT token.
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Missing email or password.");
  }

  const params = {
    TableName: USERS_TABLE,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email },
  };

  const data = await dynamoDB.query(params).promise();
  const user = data.Items.length > 0 ? data.Items[0] : null;

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new Error("Invalid credentials.");
  }

  return { success: true, token: generateToken(user.userId) };
};

/**
 * Fetch a user by ID from DynamoDB.
 */
export const getUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const params = {
    TableName: USERS_TABLE,
    Key: { userId },
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item || null;
};

/**
 * Create a new customer in DynamoDB.
 */
export const createCustomer = async ({ name, address, companyName, email, phone }) => {
    if (!name || !email || !phone) {
      throw new Error("Name, email, and phone are required.");
    }
  
    const customerId = uuidv4();
    const params = {
      TableName: CUSTOMERS_TABLE,
      Item: {
        customerId,
        name,
        address: address || "N/A",
        companyName: companyName || "N/A",
        email,
        phone,
        createdAt: new Date().toISOString(),
      },
    };
  
    await dynamoDB.put(params).promise();
    return { success: true, message: "Customer added successfully!", customer: params.Item };
  };
  
  /**
   * Retrieve all customers from DynamoDB.
   */
  export const getCustomers = async () => {
    const params = { TableName: CUSTOMERS_TABLE };
  
    const result = await dynamoDB.scan(params).promise();
    return result.Items || [];
  };
