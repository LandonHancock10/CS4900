import request from "supertest";
import app from "../server.js";
import { getUser, createUser } from "../src/services/userService.js";
jest.mock("../src/services/userService.js");

// ✅ Mock the Service Layer
jest.mock("../webspark-crm-api/src/services/userService.js");

describe("API Tests", () => {
  it("should return a user when queried by ID", async () => {
    const mockUser = { id: "123", name: "John Doe" };
    getUser.mockResolvedValue(mockUser);

    const response = await request(app).get("/users/123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(getUser).toHaveBeenCalledWith("123");
  });

  it("should return 404 when user is not found", async () => {
    getUser.mockResolvedValue(null);

    const response = await request(app).get("/users/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "User not found" });
  });

  it("should create a new user successfully", async () => {
    const mockUser = { id: "123", name: "John Doe" };
    createUser.mockResolvedValue({ success: true });

    const response = await request(app).post("/users").send(mockUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true });
    expect(createUser).toHaveBeenCalledWith(mockUser);
  });

  it("should return 400 for invalid user data", async () => {
    createUser.mockRejectedValue(new Error("Invalid user data"));

    const response = await request(app).post("/users").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid user data" });
  });
});
