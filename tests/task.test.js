const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const Category = require("../models/category.model");

let userToken;
let adminToken;
let userId;
let adminId;
let userCategoryId;
let userTaskId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Task.deleteMany({});
  await Category.deleteMany({});

  const userRes = await request(app).post("/api/auth/register").send({
    username: "taskuser",
    email: "taskuser@test.com",
    password: "password123",
  });
  userToken = userRes.body.token;
  userId = userRes.body.user.id;

  const adminRes = await request(app).post("/api/auth/register").send({
    username: "taskadmin",
    email: "taskadmin@test.com",
    password: "password123",
    role: "admin",
  });
  adminToken = adminRes.body.token;
  adminId = adminRes.body.user.id;

  const categoryRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ name: "User Category" });
  userCategoryId = categoryRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Task API: /api/tasks", () => {
  describe("POST /", () => {
    it("should fail to create a task without authentication", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "Unauthorized Task" });
      expect(res.statusCode).toBe(401);
    });

    it("should create a task successfully for an authenticated user", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "My First Task",
          description: "This is important",
          priority: "high",
          category: userCategoryId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe("My First Task");
      expect(res.body.priority).toBe("high");
      expect(res.body.user).toBe(userId);
      userTaskId = res.body._id;
    });

    it("should fail to create a task with invalid data (e.g., no title)", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ description: "A task without title" });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].path).toBe("title");
    });
  });

  describe("GET /", () => {
    it("should get all tasks for the authenticated user", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "My Second Task", priority: "low" });

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].user).toBe(userId);
    });

    it("should filter tasks by status", async () => {
      await request(app)
        .put(`/api/tasks/${userTaskId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "completed" });

      const res = await request(app)
        .get("/api/tasks?status=completed")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].status).toBe("completed");
    });
  });

  describe("GET /:id", () => {
    it("should get a single task by its ID", async () => {
      const res = await request(app)
        .get(`/api/tasks/${userTaskId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe("My First Task");
    });

    it("should fail to get a task belonging to another user", async () => {
      const res = await request(app)
        .get(`/api/tasks/${userTaskId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /:id", () => {
    it("should update a user's own task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${userTaskId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "in_progress", priority: "medium" });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("in_progress");
      expect(res.body.priority).toBe("medium");
    });

    it("should fail to update a task that does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Does not exist" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a user's own task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userTaskId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Task successfully deleted");
    });

    it("should fail to delete a task that has already been deleted", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userTaskId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
