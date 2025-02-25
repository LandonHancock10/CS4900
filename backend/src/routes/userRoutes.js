import express from "express";
import { registerUser, authenticateUser, fetchUser } from "../controllers/userController.js"; 

const router = express.Router();

// **Route for user signup**
router.post("/signup", registerUser);

// **Route for user login**
router.post("/login", authenticateUser);

// **Route to retrieve a user by ID**
router.get("/:id", fetchUser); 

export default router;
