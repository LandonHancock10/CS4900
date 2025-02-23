import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure the DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-west-2",
});

// Create a DynamoDB Document Client for easier data handling
const dynamoDB = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // Remove undefined values from DynamoDB items
  },
  unmarshallOptions: {
    wrapNumbers: false, // Prevent numbers from being returned as string objects
  },
});

export default dynamoDB;
