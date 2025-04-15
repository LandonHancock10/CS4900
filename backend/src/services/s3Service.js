import AWS from "aws-sdk";

// Use your existing AWS configuration
AWS.config.update({
  region: process.env.AWS_REGION || "us-west-1",
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "webspark-crm";

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} entityType - Type of entity (user/customer)
 * @param {string} entityId - ID of the entity (userId/customerId)
 * @param {string} originalName - Original file name
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
export const uploadProfilePicture = async (fileBuffer, entityType, entityId, originalName) => {
  if (!fileBuffer) throw new Error("File buffer is required");
  
  // Extract file extension from original name
  const fileExtension = originalName.split(".").pop().toLowerCase();
  
  // Create a unique file name
  const fileName = `${entityType}/${entityId}/profile-${Date.now()}.${fileExtension}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: `image/${fileExtension}`,
    ACL: "public-read",
  };

  try {
    await s3.upload(params).promise();
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload profile picture");
  }
};