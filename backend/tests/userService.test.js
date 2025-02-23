import { jest } from "@jest/globals";
import { getUser, createUser } from "../../frontend/src/services/userService";
import { getUserFromDB, saveUserToDB } from "../src/database/dynamoService";

jest.mock("../src/services/dynamoService", () => ({
  getUserFromDB: jest.fn(),
  saveUserToDB: jest.fn(),
}));

describe("User Service Tests", () => {
  it("should fetch a user successfully", async () => {
    const mockUser = { id: "123", name: "John Doe" };
    getUserFromDB.mockResolvedValue(mockUser);

    const result = await getUser("123");

    expect(result).toEqual(mockUser);
    expect(getUserFromDB).toHaveBeenCalledWith("123");
  });

  it("should throw an error if no user ID is provided", async () => {
    await expect(getUser()).rejects.toThrow("User ID is required");
  });

  it("should create a user successfully", async () => {
    const mockUser = { id: "123", name: "John Doe" };
    saveUserToDB.mockResolvedValue({ success: true });

    const result = await createUser(mockUser);

    expect(result).toEqual({ success: true });
    expect(saveUserToDB).toHaveBeenCalledWith(mockUser);
  });

  it("should throw an error if invalid user data is provided", async () => {
    await expect(createUser(null)).rejects.toThrow("Invalid user data");
    await expect(createUser({})).rejects.toThrow("Invalid user data");
    await expect(createUser({ id: "123" })).rejects.toThrow("Invalid user data");
  });
});
