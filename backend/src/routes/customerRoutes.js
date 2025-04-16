import express from "express";
import { 
  addCustomer, 
  fetchCustomers, 
  fetchCustomerById,
  updateCustomerInfo,
  updateCustomerTasks,
  updateCustomerNotes,
  updateCustomerAssignedUsers,
  removeCustomer,
  uploadCustomerProfilePicture
} from "../controllers/customerController.js";

const router = express.Router();

router.post("/", addCustomer);
router.get("/", fetchCustomers);
router.get("/:customerId", fetchCustomerById);
router.put("/:customerId", updateCustomerInfo);
router.put("/:customerId/tasks", updateCustomerTasks);
router.put("/:customerId/notes", updateCustomerNotes);
router.put("/:customerId/users", updateCustomerAssignedUsers);
router.delete("/:customerId", removeCustomer);
router.post("/:customerId/profile-picture", uploadCustomerProfilePicture);

export default router;