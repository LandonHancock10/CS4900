const express = require("express");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();
app.use(express.json());

// AWS DynamoDB Config
AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Users";

// Generate JWT Token
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

// Signup Endpoint
app.post("/signup", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const params = {
        TableName: TABLE_NAME,
        Item: { userId: AWS.util.uuid.v4(), email, passwordHash: hashedPassword, firstName, lastName },
    };

    try {
        await dynamoDB.put(params).promise();
        res.json({ success: true, message: "User created successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const params = {
        TableName: TABLE_NAME,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
    };

    try {
        const data = await dynamoDB.query(params).promise();
        const user = data.Items[0];

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        res.json({ success: true, token: generateToken(user.userId) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export for AWS Lambda
module.exports.handler = serverless(app);