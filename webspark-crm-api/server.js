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

    const { email, password, firstName, lastName } = req.body;

    // ✅ Validate request body
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        if (typeof password !== "string" || password.trim() === "") {
            throw new Error("Invalid password format.");
        }

        // ✅ Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ✅ Save user in DynamoDB
        const params = {
            TableName: TABLE_NAME,
            Item: { 
                userId: uuidv4(), 
                email, 
                passwordHash: hashedPassword, 
                firstName, 
                lastName 
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

    // ✅ Query user from DynamoDB
    const params = {
        TableName: TABLE_NAME,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        if (!data.Items || data.Items.length === 0) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        const user = data.Items[0];

        // ✅ Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        res.json({ success: true, token: generateToken(user.userId) });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports.handler = serverless(app);