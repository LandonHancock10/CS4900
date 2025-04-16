import { uploadProfilePicture } from "../services/s3Service.js";
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
import dynamoClient from "../config/dynamoClient.js";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

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
    
    // Log the incoming request to see what's being received
    console.log("Received notes update request:", {
      customerId,
      requestBody: req.body
    });
    
    // Get notes from request body - could be sent as notes or directly
    const notes = req.body.notes !== undefined ? req.body.notes : req.body;
    
    console.log("Extracted notes value:", notes);
    
    // Validate that notes is a string
    if (typeof notes !== 'string') {
      console.error("Invalid notes format, expected string but received:", typeof notes);
      return res.status(400).json({ 
        success: false, 
        message: "Notes must be a string value" 
      });
    }
    
    const result = await updateNotes(customerId, notes);
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

export const uploadCustomerProfilePicture = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log("Processing profile picture upload for customerId:", customerId);
    
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      console.error("No image data provided in request body");
      return res.status(400).json({
        success: false,
        message: "No image data provided"
      });
    }
    
    console.log("Profile picture data received (length):", profilePicture.length);
    console.log("Profile picture data prefix:", profilePicture.substring(0, 50) + "...");
    
    // Verify the customer exists first
    let customerExists = false;
    try {
      const customer = await getCustomerById(customerId);
      customerExists = true;
      console.log("Customer found:", { 
        customerId: customer.customerId,
        name: customer.name
      });
    } catch (error) {
      console.error("Customer lookup error:", error);
      console.error("Customer not found in database with ID:", customerId);
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    
    if (!customerExists) {
      console.error("Customer not found but no error was thrown");
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    
    // Extract the actual base64 data
    let base64Data;
    try {
      if (!profilePicture.includes('base64,')) {
        console.error("Invalid base64 format, missing 'base64,' marker");
        return res.status(400).json({
          success: false,
          message: "Invalid image format"
        });
      }
      
      base64Data = profilePicture.split(',')[1];
      console.log("Base64 data extracted, length:", base64Data.length);
    } catch (error) {
      console.error("Error extracting base64 data:", error);
      return res.status(400).json({
        success: false,
        message: "Error processing image data"
      });
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    console.log("Converted to buffer, size:", buffer.length);
    
    // Get the file type
    let fileType;
    try {
      fileType = profilePicture.split(';')[0].split('/')[1];
      console.log("Detected file type:", fileType);
      
      if (!['jpeg', 'jpg', 'png', 'gif'].includes(fileType)) {
        console.error("Unsupported file type:", fileType);
        return res.status(400).json({
          success: false,
          message: "Unsupported file type"
        });
      }
    } catch (error) {
      console.error("Error detecting file type:", error);
      fileType = 'jpeg'; // Default to JPEG
      console.log("Using default file type:", fileType);
    }
    
    // Upload to S3
    let pictureUrl;
    try {
      console.log("Uploading to S3...");
      pictureUrl = await uploadProfilePicture(
        buffer,
        'customers',
        customerId,
        `profile.${fileType}`
      );
      console.log("S3 upload successful, URL:", pictureUrl);
    } catch (s3Error) {
      console.error("S3 upload error:", s3Error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to storage"
      });
    }
    
    // Update customer in DynamoDB
    try {
      console.log("Updating DynamoDB record...");
      console.log("Update params:", {
        TableName: "Customers",
        Key: { customerId },
        UpdateExpression: "set profilePicture = :pictureUrl",
        ExpressionAttributeValues: {
          ":pictureUrl": pictureUrl
        }
      });
      
      const updateParams = {
        TableName: "Customers",
        Key: { customerId },
        UpdateExpression: "set profilePicture = :pictureUrl",
        ExpressionAttributeValues: {
          ":pictureUrl": pictureUrl
        },
        ReturnValues: "ALL_NEW"
      };
      
      const updateResult = await dynamoClient.send(new UpdateCommand(updateParams));
      console.log("DynamoDB update successful, updated customer:", {
        customerId: updateResult.Attributes.customerId,
        profilePicture: updateResult.Attributes.profilePicture
      });
        
      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePictureUrl: pictureUrl
      });
    } catch (dbError) {
      console.error("DynamoDB update error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to update customer record"
      });
    }
  } catch (error) {
    console.error("Unexpected error in uploadCustomerProfilePicture:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture"
    });
  }
};