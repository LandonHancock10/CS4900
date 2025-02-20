import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const CUSTOMERS_TABLE = "Customers";

/**
 * Create a new customer in DynamoDB.
 */
export const createCustomer = async ({ name, address, companyName, email, phone }) => {
  if (!name || !email || !phone) {
    throw new Error("Name, email, and phone are required.");
  }

  const customerId = uuidv4();
  const params = {
    TableName: CUSTOMERS_TABLE,
    Item: {
      customerId,
      name,
      address: address || "N/A",
      companyName: companyName || "N/A",
      email,
      phone,
      createdAt: new Date().toISOString(),
    },
  };

  await dynamoDB.put(params).promise();
  return { success: true, message: "Customer added successfully!", customer: params.Item };
};

/**
 * Retrieve all customers from DynamoDB.
 */
export const getCustomers = async () => {
  const params = { TableName: CUSTOMERS_TABLE };

  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
};
