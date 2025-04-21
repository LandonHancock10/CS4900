import { updateAssignedUsers } from "../src/services/customerService.js";
import { jest } from "@jest/globals";

// Mock the DynamoDB client
const mockDynamoDB = {
  get: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  promise: jest.fn()
};

jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => mockDynamoDB),
  },
}));

describe("User Assignment - Service Tests", () => {
  let testCustomerId, testUserId1, testUserId2;
  
  beforeEach(() => {
    jest.clearAllMocks();
    testCustomerId = "test-customer-id-123";
    testUserId1 = "test-user-id-1";
    testUserId2 = "test-user-id-2";
    
    // Mock the customer in DynamoDB
    mockDynamoDB.get().promise.mockResolvedValue({
      Item: {
        customerId: testCustomerId,
        name: "Test Customer",
        assignedUsers: [testUserId1]
      }
    });
    
    mockDynamoDB.update().promise.mockResolvedValue({});
  });

  test("Should assign a new user to customer", async () => {
    const updatedUsers = [testUserId1, testUserId2];
    
    const result = await updateAssignedUsers(testCustomerId, updatedUsers);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
  });
  
  test("Should remove an assigned user from customer", async () => {
    // Keep just one user assigned (removing testUserId1)
    const updatedUsers = [testUserId2];
    
    const result = await updateAssignedUsers(testCustomerId, updatedUsers);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
  });
  
  test("Should handle empty assignedUsers array", async () => {
    const updatedUsers = []; // Remove all assigned users
    
    const result = await updateAssignedUsers(testCustomerId, updatedUsers);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
  });
  
});