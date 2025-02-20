import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { parseLambdaEventBody, signupUser, loginUser, getUser } from "./src/services/userService.js";
import * as customerService from "./src/services/customerService.js";
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// CORS Preflight Handling
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

// **Signup Route**
app.post("/signup", parseLambdaEventBody, async (req, res) => {
  try {
    console.log("Incoming /signup request body:", req.body);
    const result = await signupUser(req.body);
    res.json(result);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// **Login Route**
app.post("/login", parseLambdaEventBody, async (req, res) => {
  try {
    console.log("Incoming /login request body:", req.body);
    const result = await loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// **Add a Customer Route**
app.post("/customers", parseLambdaEventBody, async (req, res) => {
  try {
    console.log("Incoming /customers request body:", req.body);
    const result = await createCustomer(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// **Retrieve all customers**
app.get("/customers", async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json({ success: true, customers });
  } catch (error) {
    console.error("Error retrieving customers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **Get User Route**
app.get("/users/:id", async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Export handler for AWS Lambda
export const handler = serverless(app);
