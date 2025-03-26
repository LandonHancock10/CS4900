import { createCustomer } from "../src/services/customerService.js";
import { jest } from "@jest/globals";

describe("Customer Service - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should create a customer with required fields", async () => {
    const customerData = {
      name: "Test Integration Customer",
      email: "test-integration@example.com",
      phone: "123-456-7890"
    };

    const result = await createCustomer(customerData);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe("Customer added successfully!");
    expect(result.customer.name).toBe("Test Integration Customer");
    expect(typeof result.customer.customerId).toBe("string");
    // Just check that a UUID was generated, not what specific value
  });

  test("Should throw error when missing required fields", async () => {
    const incompleteData = {
      name: "John Doe"
      // Missing email and phone
    };
    
    await expect(createCustomer(incompleteData))
      .rejects
      .toThrow("Name, email, and phone are required.");
  });
});