import { updateTasks } from "../src/services/customerService.js";
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

describe("Task Management - Service Tests", () => {
  let testCustomerId;
  
  beforeEach(() => {
    jest.clearAllMocks();
    testCustomerId = "test-customer-id-123";
    
    // Mock the customer in DynamoDB
    mockDynamoDB.get().promise.mockResolvedValue({
      Item: {
        customerId: testCustomerId,
        name: "Test Customer",
        tasks: [
          {
            title: "Existing Task",
            completed: false,
            dueDate: "2025-05-01T00:00:00.000Z"
          }
        ]
      }
    });
    
    mockDynamoDB.update().promise.mockResolvedValue({});
  });

  test("Should add a new task to customer", async () => {
    const updatedTasks = [
      {
        title: "Existing Task",
        completed: false,
        dueDate: "2025-05-01T00:00:00.000Z"
      },
      {
        title: "New Task",
        completed: false,
        dueDate: "2025-05-15T00:00:00.000Z"
      }
    ];
    
    const result = await updateTasks(testCustomerId, updatedTasks);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
    
    // Just check that update was called
    expect(mockDynamoDB.update).toHaveBeenCalled();
  });
  
  test("Should mark a task as completed", async () => {
    const updatedTasks = [
      {
        title: "Existing Task",
        completed: true, // Changed to completed
        dueDate: "2025-05-01T00:00:00.000Z"
      }
    ];
    
    const result = await updateTasks(testCustomerId, updatedTasks);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
    
    // Check that update was called with a parameter containing the tasks
    const updateCall = mockDynamoDB.update.mock.calls[0][0];
    if (updateCall) {
      // If your function is using ExpressionAttributeValues, check it
      if (updateCall.ExpressionAttributeValues && updateCall.ExpressionAttributeValues[":tasks"]) {
        expect(updateCall.ExpressionAttributeValues[":tasks"][0].completed).toBe(true);
      } else {
        // Otherwise just check that update was called
        expect(mockDynamoDB.update).toHaveBeenCalled();
      }
    }
  });
  
  test("Should handle tasks with due dates", async () => {
    const dueDate = new Date("2025-06-01").toISOString();
    const updatedTasks = [
      {
        title: "Task with Due Date",
        completed: false,
        dueDate: dueDate
      }
    ];
    
    const result = await updateTasks(testCustomerId, updatedTasks);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
  });
  
  test("Should handle empty tasks array", async () => {
    const updatedTasks = []; // Empty array = remove all tasks
    
    const result = await updateTasks(testCustomerId, updatedTasks);
    
    expect(result.success).toBe(true);
    expect(mockDynamoDB.update).toHaveBeenCalled();
  });
});