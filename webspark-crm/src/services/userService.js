import { getUserFromDB, saveUserToDB } from "./dynamoService";

/**
 * Fetch user by ID from DynamoDB
 */
export const getUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return await getUserFromDB(userId);
};

/**
 * Create a new user in DynamoDB
 */
export const createUser = async (user) => {
  if (!user || !user.id || !user.name) {
    throw new Error("Invalid user data");
  }

  return await saveUserToDB(user);
};
