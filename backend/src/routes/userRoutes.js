import express from "express";
import { registerUser, authenticateUser, fetchUser, uploadUserProfilePicture } from "../controllers/userController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.post("/signup", registerUser);
router.post("/login", authenticateUser);
router.get("/:id", fetchUser);

router.post("/:id/profile-picture", upload.single("profilePicture"), uploadUserProfilePicture);

export default router;