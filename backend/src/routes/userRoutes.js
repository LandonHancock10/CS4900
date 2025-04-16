import express from "express";
import { registerUser, authenticateUser, fetchUser, uploadUserProfilePicture } from "../controllers/userController.js";

const router = express.Router();
router.post("/signup", registerUser);
router.post("/login", authenticateUser);
router.get("/:id", fetchUser);
router.post("/:id/profile-picture", uploadUserProfilePicture);

export default router;