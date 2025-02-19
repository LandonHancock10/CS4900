const express = require("express");
const AWS = require("aws-sdk");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();

// Ensure API Gateway's request body is parsed correctly
app.use(express.json());
app.use(cors({ origin: "*" }));

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

// AWS DynamoDB Setup
AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = "Users";
const CUSTOMERS_TABLE = "Customers"; // New Customers Table

// Generate JWT token
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

// Middleware to parse request body from AWS Lambda
const parseLambdaEventBody = (req, res, next) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString("utf8"));
    } else if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid request body format." });
  }
  next();
};

/* =================== USER AUTH ROUTES =================== */
// **Signup Route**
app.post("/signup", parseLambdaEventBody, async (req, res) => {
  try {
    console.log("Incoming /signup request body:", req.body);
    const { email, password, firstName, lastName, profilePicture } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: "All fields are required." });
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
    res.json({ success: true, message: "User created successfully!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// **Login Route**
app.post("/login", parseLambdaEventBody, async (req, res) => {
  try {
    console.log("Incoming /login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password." });
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
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, token: generateToken(user.userId) });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =================== CUSTOMER MANAGEMENT ROUTES =================== */
// **Create a New Customer**
app.post("/customers", async (req, res) => {
  try {
    const { name, address, companyName, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "Name, email, and phone are required." });
    }

    const customerId = uuidv4();

    const newCustomer = {
      customerId,
      name,
      address: address || "N/A",
      companyName: companyName || "N/A",
      email,
      phone,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: CUSTOMERS_TABLE,
      Item: newCustomer,
    };

    await dynamoDB.put(params).promise();

    res.json({ success: true, message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **Retrieve Customer Info by ID**
app.get("/customers/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const params = {
      TableName: CUSTOMERS_TABLE,
      Key: { customerId },
    };

    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer: result.Item });
  } catch (error) {
    console.error("Error retrieving customer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **Search Customers by Name, Company, or Address**
app.get("/customers/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }

    const params = {
      TableName: CUSTOMERS_TABLE,
      FilterExpression: "contains(name, :query) OR contains(companyName, :query) OR contains(address, :query)",
      ExpressionAttributeValues: { ":query": query },
    };

    const result = await dynamoDB.scan(params).promise();

    res.json({ success: true, customers: result.Items });
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Export handler for AWS Lambda
module.exports.handler = serverless(app);