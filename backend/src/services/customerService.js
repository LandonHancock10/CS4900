import { v4 as uuidv4 } from "uuid";
import dynamoClient from "../config/dynamoClient.js";
import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const CUSTOMERS_TABLE = "Customers";

/**
 * Create a new customer in DynamoDB with simplified tabs.
 */
export const createCustomer = async ({ name, address, companyName, email, phone, profilePicture }) => {
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
      profilePicture: profilePicture || null,
      createdAt: new Date().toISOString(),
      // Simplified tabs structure
      information: {
        notes: ""
      },
      tasks: [],
      assignedUsers: []
    },
  };

  try {
    await dynamoClient.send(new PutCommand(params));
    return { success: true, message: "Customer added successfully!", customer: params.Item };
  } catch (error) {
    console.error("Error creating customer in DynamoDB:", error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

/**
 * Retrieve all customers from DynamoDB.
 */
export const getCustomers = async () => {
  const params = { TableName: CUSTOMERS_TABLE };

  try {
    const result = await dynamoClient.send(new ScanCommand(params));
    return result.Items || [];
  } catch (error) {
    console.error("Error fetching customers from DynamoDB:", error);
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }
};

/**
 * Get a single customer by ID.
 */
export const getCustomerById = async (customerId) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId }
  };

  try {
    const result = await dynamoClient.send(new GetCommand(params));
    if (!result.Item) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    return result.Item;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }
};

/**
 * Update customer information.
 */
export const updateCustomer = async (customerId, updates) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  // Get current customer to ensure it exists
  await getCustomerById(customerId);

  // Build update expression and attribute values
  let updateExpression = "SET ";
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.keys(updates).forEach((key, index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:value${index}`;
    
    updateExpression += `${index > 0 ? ', ' : ''}${attrName} = ${attrValue}`;
    expressionAttributeNames[attrName] = key;
    expressionAttributeValues[attrValue] = updates[key];
  });

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoClient.send(new UpdateCommand(params));
    return { success: true, message: "Customer updated successfully", customer: result.Attributes };
  } catch (error) {
    console.error(`Error updating customer ${customerId}:`, error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }
};

/**
 * Update customer tasks.
 */
export const updateTasks = async (customerId, tasks) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  // Ensure tasks is an array
  if (!Array.isArray(tasks)) {
    throw new Error("Tasks must be an array");
  }

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId },
    UpdateExpression: "SET tasks = :tasks",
    ExpressionAttributeValues: {
      ":tasks": tasks
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoClient.send(new UpdateCommand(params));
    return { 
      success: true, 
      message: "Tasks updated successfully",
      customer: result.Attributes
    };
  } catch (error) {
    console.error(`Error updating tasks for customer ${customerId}:`, error);
    throw new Error(`Failed to update tasks: ${error.message}`);
  }
};

/**
 * Update customer notes.
 */
export const updateNotes = async (customerId, notes) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId },
    UpdateExpression: "SET information.notes = :notes",
    ExpressionAttributeValues: {
      ":notes": notes
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoClient.send(new UpdateCommand(params));
    return { 
      success: true, 
      message: "Notes updated successfully",
      customer: result.Attributes
    };
  } catch (error) {
    console.error(`Error updating notes for customer ${customerId}:`, error);
    throw new Error(`Failed to update notes: ${error.message}`);
  }
};

/**
 * Assign or remove users from a customer.
 */
export const updateAssignedUsers = async (customerId, assignedUsers) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  if (!Array.isArray(assignedUsers)) {
    throw new Error("Assigned users must be an array");
  }

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId },
    UpdateExpression: "SET assignedUsers = :assignedUsers",
    ExpressionAttributeValues: {
      ":assignedUsers": assignedUsers
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoClient.send(new UpdateCommand(params));
    return { 
      success: true, 
      message: "Assigned users updated successfully",
      customer: result.Attributes
    };
  } catch (error) {
    console.error(`Error updating assigned users for customer ${customerId}:`, error);
    throw new Error(`Failed to update assigned users: ${error.message}`);
  }
};

/**
 * Delete a customer.
 */
export const deleteCustomer = async (customerId) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId }
  };

  try {
    await dynamoClient.send(new DeleteCommand(params));
    return { 
      success: true, 
      message: "Customer deleted successfully"
    };
  } catch (error) {
    console.error(`Error deleting customer ${customerId}:`, error);
    throw new Error(`Failed to delete customer: ${error.message}`);
  }
};