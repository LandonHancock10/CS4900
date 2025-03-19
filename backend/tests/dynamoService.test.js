import { signupUser } from "../src/services/userService.js";
import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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

describe("DynamoDB Service - User Tests", () => {
  let testEmail, testUserId;

  beforeEach(() => {
    jest.clearAllMocks();
    testUserId = uuidv4(); 
    testEmail = `test+${uuidv4()}@example.com`; 
  });

  test("Should create a new user in DynamoDB", async () => {
    mockDynamoDB.query().promise.mockResolvedValue({ Items: [] }); 
    mockDynamoDB.put().promise.mockResolvedValue({});

    const result = await signupUser({
      email: testEmail,
      password: "TestPass123!",
      firstName: "John",
      lastName: "Doe",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("User created successfully!");
    expect(mockDynamoDB.put).toHaveBeenCalled();
  });
});
