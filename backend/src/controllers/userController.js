import { signupUser, loginUser, getUser } from "../services/userService.js";
import { uploadProfilePicture } from "../services/s3Service.js";
import AWS from "aws-sdk";
const dynamoDB = new AWS.DynamoDB.DocumentClient();

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

export const uploadUserProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Processing profile picture upload for userId:", userId);
    
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: "No image data provided"
      });
    }
    
    console.log("Profile picture data received (length):", profilePicture.length);
    
    // Extract the actual base64 data
    const base64Data = profilePicture.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    console.log("Converted to buffer, size:", buffer.length);
    
    // Get the file type
    const fileType = profilePicture.split(';')[0].split('/')[1];
    console.log("Detected file type:", fileType);
    
    // Before updating, verify the user exists
    try {
      const userCheck = await dynamoDB.get({
        TableName: "Users",
        Key: { userId }
      }).promise();
      
      if (!userCheck.Item) {
        console.error("User not found in database with ID:", userId);
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      console.log("Found existing user:", userCheck.Item);
    } catch (checkError) {
      console.error("Error checking for user:", checkError);
      throw new Error(`Failed to verify user: ${checkError.message}`);
    }
    
    // Upload to S3
    console.log("Uploading to S3...");
    const pictureUrl = await uploadProfilePicture(
      buffer,
      'users',
      userId,
      `profile.${fileType}`
    );
    console.log("S3 upload successful, URL:", pictureUrl);
    
    // Update user in DynamoDB
    console.log("Updating DynamoDB record...");
    console.log("Update params:", {
      TableName: "Users",
      Key: { userId },
      UpdateExpression: "set profilePicture = :pictureUrl",
      ExpressionAttributeValues: {
        ":pictureUrl": pictureUrl
      }
    });
    
    try {
      const updateResult = await dynamoDB.update({
        TableName: "Users",
        Key: { userId },
        UpdateExpression: "set profilePicture = :pictureUrl",
        ExpressionAttributeValues: {
          ":pictureUrl": pictureUrl
        },
        ReturnValues: "ALL_NEW" // This returns the updated item
      }).promise();
      
      console.log("DynamoDB update successful, updated user:", updateResult.Attributes);
      
      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePictureUrl: pictureUrl
      });
    } catch (dbError) {
      console.error("DynamoDB update error:", dbError);
      throw new Error(`DynamoDB update failed: ${dbError.message}`);
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture"
    });
  }
};