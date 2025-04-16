import { registerUser, authenticateUser, fetchUser, fetchAllUsers, uploadUserProfilePicture } from "../controllers/userController.js";

const router = express.Router();
router.post("/signup", registerUser);
router.post("/login", authenticateUser);
router.get("/:id", fetchUser);
router.get("/", fetchAllUsers);
router.post("/:id/profile-picture", uploadUserProfilePicture);

export default router;