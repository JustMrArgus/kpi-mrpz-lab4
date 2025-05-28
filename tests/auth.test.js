const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user.model");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Auth API: /api/auth", () => {
  const newUser = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  };
  const adminUser = {
    username: "adminuser",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  };

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(newUser);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.username).toBe(newUser.username);
      expect(res.body.user.email).toBe(newUser.email);
    });

    it("should fail to register with an existing username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...newUser, email: "new@email.com" });
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe(
        "User with this name or email already exists"
      );
    });

    it("should fail to register with an existing email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...newUser, username: "newuser" });
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe(
        "User with this name or email already exists"
      );
    });

    it("should fail with missing password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "failuser", email: "fail@e.com" });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /login", () => {
    it("should login the user and return a token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: newUser.email, password: newUser.password });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
  });
});
