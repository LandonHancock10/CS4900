import { createCustomer, getCustomers } from "../services/customerService.js";

/**
 * Controller to handle adding a new customer.
 */
export const addCustomer = async (req, res) => {
  try {
    console.log("Incoming /customers request body:", req.body);
    const result = await createCustomer(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle retrieving all customers.
 */
export const fetchCustomers = async (req, res) => {
  try {
    const customers = await getCustomers();
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error("Error retrieving customers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
