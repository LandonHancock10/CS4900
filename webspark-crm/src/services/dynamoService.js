// src/services/dynamoService.js
import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs'; // Import bcrypt for hashing
import { v4 as uuidv4 } from 'uuid'; // For generating unique userId
VUE_APP_AWS_REGION=us-west-1

// Configure AWS
AWS.config.update({
  region: process.env.VUE_APP_AWS_REGION,
  accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Users';

// Create user function
export const createUser = async (user) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds); // Hash the password

  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId: uuidv4(), // Unique ID for partition key
      email: user.email, // Store email but not as the key
      passwordHash: hashedPassword, // Store the hashed password
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture || 'default.png',
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return { success: true, message: 'User created successfully!' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Error creating user.' };
  }
};

// Login user function
export const loginUser = async (email, password) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    const result = await dynamoDB.scan(params).promise(); // Scan the table for matching email
    const user = result.Items.length > 0 ? result.Items[0] : null;

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password.' };
    }

    return { success: true, message: 'Login successful!', user };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, message: 'Error logging in.' };
  }
};
