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

AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Users";

// Generate JWT token
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

// Middleware to parse request body from AWS Lambda
const parseLambdaEventBody = (req, res, next) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString("utf8")); // Convert Buffer to string and parse JSON
    } else if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid request body format." });
  }
  next();
};

// **Signup Route**
app.post("/signup", parseLambdaEventBody, async (req, res) => {
  try {
    console.log("Incoming /signup request body:", req.body);

    const { email, password, firstName, lastName, profilePicture } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Password must be a string." });
    }

    // **Hash the password correctly**
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const params = {
      TableName: TABLE_NAME,
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
      TableName: TABLE_NAME,
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

// Export handler for AWS Lambda
module.exports.handler = serverless(app);
