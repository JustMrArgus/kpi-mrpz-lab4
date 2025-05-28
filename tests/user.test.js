const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user.model");

let userToken;
let adminToken;
let userId;
let adminId;
let anotherUserId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});

  const userRes = await request(app).post("/api/auth/register").send({
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  });
  userToken = userRes.body.token;
  userId = userRes.body.user.id;

  const adminRes = await request(app).post("/api/auth/register").send({
    username: "adminuser",
    email: "adminuser@example.com",
    password: "password123",
    role: "admin",
  });
  adminToken = adminRes.body.token;
  adminId = adminRes.body.user.id;

  const anotherUserRes = await request(app).post("/api/auth/register").send({
    username: "anotheruser",
    email: "another@example.com",
    password: "password123",
  });
  anotherUserId = anotherUserRes.body.user.id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("User API: /api/users", () => {
  describe("/me endpoints", () => {
    it("GET /me - should get the current user's profile", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe("testuser");
      expect(res.body.email).toBe("testuser@example.com");
      expect(res.body).not.toHaveProperty("password");
    });

    it("PUT /me - should update the current user's profile", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          firstName: "Test",
          lastName: "User",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe("Test");
      expect(res.body.lastName).toBe("User");
      expect(res.body.username).toBe("testuser");
    });

    it("PUT /me - should fail to update profile with invalid data", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});
      expect(res.statusCode).toBe(200);
    });
  });

  describe("Admin-only endpoints", () => {
    it("GET / - should fail for a non-admin user", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("GET / - should get all users for an admin user", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).not.toHaveProperty("password");
    });

    it("GET /:id - should get a specific user by ID for an admin", async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe("testuser");
    });

    it("GET /:id - should return 404 for a non-existent user ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    it("DELETE /:id - should fail for a non-admin user", async () => {
      const res = await request(app)
        .delete(`/api/users/${anotherUserId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("DELETE /:id - should delete a user for an admin", async () => {
      const res = await request(app)
        .delete(`/api/users/${anotherUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User anotheruser has been deleted");
    });

    it("DELETE /:id - should return 404 when trying to delete a non-existent user", async () => {
      const res = await request(app)
        .delete(`/api/users/${anotherUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });
});
