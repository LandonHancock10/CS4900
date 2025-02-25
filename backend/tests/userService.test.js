import { signupUser, loginUser } from "../src/services/userService.js";
import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// ✅ Set JWT_SECRET before running tests
process.env.JWT_SECRET = "test_secret";

// ✅ Mock DynamoDB
const mockDynamoDB = {
  put: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  query: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};

// ✅ Mock AWS SDK
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => mockDynamoDB),
  },
}));

describe("User Service - Basic Tests", () => {
  let testEmail, testUserId, testPassword, hashedPassword;

  beforeEach(async () => {
    jest.clearAllMocks();
    testUserId = uuidv4();
    testEmail = `test1232@example.com`;
    testPassword = "TestPass123!";
    hashedPassword = await bcrypt.hash(testPassword, 10);
  });

  test("Should successfully create a user", async () => {
    mockDynamoDB.query().promise.mockResolvedValue({ Items: [] });
    mockDynamoDB.put().promise.mockResolvedValue({});

    const result = await signupUser({
      email: testEmail,
      password: testPassword,
      firstName: "John",
      lastName: "Doe",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("User created successfully!");
    expect(mockDynamoDB.put).toHaveBeenCalled();
  });

  test("Should successfully log in with correct credentials", async () => {
    mockDynamoDB.query().promise.mockResolvedValue({
      Items: [
        {
          userId: testUserId,
          email: testEmail,
          passwordHash: await bcrypt.hash(testPassword, 10),
        },
      ],
    });
  
    const result = await loginUser(testEmail, testPassword);
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });  
});
