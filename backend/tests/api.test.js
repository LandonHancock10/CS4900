import request from "supertest";
import app from "../src/server.js";
import { v4 as uuidv4 } from "uuid";

// ✅ Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = "test_secret";

describe("API Routes - User Authentication", () => {
  let testEmail, testUserId, testPassword;

  beforeEach(() => {
    testUserId = uuidv4(); // Generate a unique user ID
    testEmail = `testuser+${uuidv4()}@example.com`; // Generate a unique email for each test
    testPassword = "TestPass123!";
  });

  test("POST /users/signup should create a new user", async () => {
    const res = await request(app).post("/users/signup").send({
      email: testEmail,
      password: testPassword,
      firstName: "John",
      lastName: "Doe",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "User created successfully!");
  });

  test("POST /users/login should authenticate a user", async () => {
    // ✅ Create a user first
    await request(app).post("/users/signup").send({
      email: testEmail,
      password: testPassword,
      firstName: "John",
      lastName: "Doe",
    });

    // ✅ Login with correct credentials
    const res = await request(app).post("/users/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token"); // Ensure token is returned
  });

  test("POST /users/login should fail with incorrect credentials", async () => {
    // ✅ Create a user first
    await request(app).post("/users/signup").send({
      email: testEmail,
      password: testPassword,
      firstName: "John",
      lastName: "Doe",
    });

    // ✅ Attempt login with wrong password
    const res = await request(app).post("/users/login").send({
      email: testEmail,
      password: "WrongPass!",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid email or password.");
  });
});
