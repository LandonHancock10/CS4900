import { signupUser, loginUser } from "../src/services/userService.js";
import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

process.env.JWT_SECRET = "test_secret";

const mockDynamoDB = {
  put: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  query: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};

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
    testEmail = `test123342@example.com`;
    testPassword = "TestPass123!";
    hashedPassword = await bcrypt.hash(testPassword, 10);
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
