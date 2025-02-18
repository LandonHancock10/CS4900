const express = require("express");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Enable CORS globally
app.use(cors({ origin: "*" }));

// ✅ Handle CORS preflight requests for all routes
app.options("*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).end();
});

// ✅ AWS DynamoDB Config
AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Users";

// ✅ JWT Token Generator
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

// ✅ Signup Endpoint
app.post("/signup", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const { email, password, firstName, lastName, profilePicture } = req.body;

    // ✅ Validate request body
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        // ✅ Ensure password is a string
        if (typeof password !== "string") {
            throw new Error("Password must be a string.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const params = {
            TableName: TABLE_NAME,
            Item: {
                userId: uuidv4(),
                email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                profilePicture: profilePicture || null, // Make profile picture optional
            },
        };

        await dynamoDB.put(params).promise();
        res.json({ success: true, message: "User created successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Login Endpoint
app.post("/login", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const { email, password } = req.body;

    // ✅ Validate request body
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password." });
    }

    const params = {
        TableName: TABLE_NAME,
        IndexName: "email-index", // Ensure this index exists in DynamoDB
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
    };

    try {
        const data = await dynamoDB.query(params).promise();
        const user = data.Items.length > 0 ? data.Items[0] : null;

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        res.json({ success: true, token: generateToken(user.userId) });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Export for AWS Lambda
module.exports.handler = serverless(app);