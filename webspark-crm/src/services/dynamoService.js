import { DynamoDBClient, PutItemCommand, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const REGION = process.env.VUE_APP_AWS_REGION;

const dynamoClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
  },
});

export async function createUser(userId, firstName, lastName, email) {
  const params = {
    TableName: "Users",
    Item: {
      userId: { S: userId },
      firstName: { S: firstName },
      lastName: { S: lastName },
      email: { S: email },
    },
  };

  const command = new PutItemCommand(params);
  try {
    await dynamoClient.send(command);
    console.log("User created successfully.");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

export async function getUser(userId) {
  const params = {
    TableName: "Users",
    Key: {
      userId: { S: userId },
    },
  };

  const command = new GetItemCommand(params);
  try {
    const response = await dynamoClient.send(command);
    return response.Item;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getAllUsers() {
  const params = { TableName: "Users" };
  const command = new ScanCommand(params);

  try {
    const data = await dynamoClient.send(command);
    return data.Items;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
