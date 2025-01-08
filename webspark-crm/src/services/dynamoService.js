import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs'; // Import bcrypt for hashing
import { v4 as uuidv4 } from 'uuid'; // For generating unique userId

// Configure AWS using environment variables passed during build
AWS.config.update({
  region: process.env.VUE_APP_AWS_REGION || 'us-west-1',
  accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Users';

// ** Create user function **
export const createUser = async (user) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds); // Hash the password

  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId: uuidv4(), // Unique userId as the partition key
      email: user.email, // Email field for user identification
      passwordHash: hashedPassword, // Store the hashed password for security
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture || 'default.png', // Optional profile picture
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

// ** Login user function **
export const loginUser = async (email, password) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    const result = await dynamoDB.scan(params).promise(); // Scan the table for the matching email
    const user = result.Items.length > 0 ? result.Items[0] : null;

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Compare the provided password with the stored hashed password
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