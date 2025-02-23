import express from "express";
import { addCustomer, fetchCustomers } from "../controllers/customerController.js";

const router = express.Router();

// **Route to add a new customer**
router.post("/customers", addCustomer);

// **Route to retrieve all customers**
router.get("/customers", fetchCustomers);

export default router;
