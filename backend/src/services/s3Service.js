import AWS from "aws-sdk";

// Use your existing AWS configuration
AWS.config.update({
  region: process.env.AWS_REGION || "us-west-2",
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "webspark-crm";


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
  };

  try {
    await s3.upload(params).promise();
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload profile picture");
  }
};