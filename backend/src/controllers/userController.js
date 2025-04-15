import { signupUser, loginUser, getUser } from "../services/userService.js";
import { uploadProfilePicture } from "../services/s3Service.js";

/**
 * Controller to handle user signup.
 */
export const registerUser = async (req, res) => {
  try {
    console.log("Incoming /signup request body:", req.body);
    const result = await signupUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle user login.
 */
export const authenticateUser = async (req, res) => {
  try {
    console.log("Incoming /login request body:", req.body);
    const result = await loginUser(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(401).json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle retrieving a user by ID.
 */
export const fetchUser = async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle profile picture uploads
 */
export const uploadUserProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Upload to S3
    const pictureUrl = await uploadProfilePicture(
      req.file.buffer,
      'users',
      userId,
      req.file.originalname
    );
    
    // Update user in DynamoDB
    await updateProfilePicture(userId, pictureUrl);
    
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePictureUrl: pictureUrl
    });
    
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture"
    });
  }
};