import express from "express";
import { 
  addCustomer, 
  fetchCustomers, 
  fetchCustomerById,
  updateCustomerInfo,
  updateCustomerTasks,
  updateCustomerNotes,
  updateCustomerAssignedUsers,
  removeCustomer
} from "../controllers/customerController.js";

const router = express.Router();

// Route to add a new customer
router.post("/", addCustomer);

// Route to retrieve all customers
router.get("/", fetchCustomers);

// Route to retrieve a single customer
router.get("/:customerId", fetchCustomerById);

// Route to update customer information
router.put("/:customerId", updateCustomerInfo);

// Route to update customer tasks
router.put("/:customerId/tasks", updateCustomerTasks);

// Route to update customer notes
router.put("/:customerId/notes", updateCustomerNotes);

// Route to update assigned users
router.put("/:customerId/users", updateCustomerAssignedUsers);

// Route to delete a customer
router.delete("/:customerId", removeCustomer);

export default router;