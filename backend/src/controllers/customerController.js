import { 
  createCustomer, 
  getCustomers, 
  getCustomerById,
  updateCustomer,
  updateTasks,
  updateNotes,
  updateAssignedUsers,
  deleteCustomer
} from "../services/customerService.js";

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

/**
 * Controller to handle retrieving a single customer.
 */
export const fetchCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await getCustomerById(customerId);
    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error("Error retrieving customer:", error);
    res.status(error.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle updating a customer.
 */
export const updateCustomerInfo = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await updateCustomer(customerId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(error.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle updating customer tasks.
 */
export const updateCustomerTasks = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await updateTasks(customerId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating tasks:", error);
    res.status(error.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle updating customer notes.
 */
export const updateCustomerNotes = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await updateNotes(customerId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(error.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle updating assigned users.
 */
export const updateCustomerAssignedUsers = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await updateAssignedUsers(customerId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating assigned users:", error);
    res.status(error.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle deleting a customer.
 */
export const removeCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await deleteCustomer(customerId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(error.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};