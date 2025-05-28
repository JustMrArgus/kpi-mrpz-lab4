const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Category = require("../models/category.model");

let userToken;
let userId;
let categoryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Category.deleteMany({});

  const userRes = await request(app).post("/api/auth/register").send({
    username: "catuser",
    email: "cat@test.com",
    password: "password123",
  });
  userToken = userRes.body.token;
  userId = userRes.body.user.id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Category API: /api/categories", () => {
  it("should fail to create category if not authenticated", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ name: "Failed Category" });
    expect(res.statusCode).toBe(401);
  });

  it("should create a new category for the authenticated user", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Personal" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Personal");
    expect(res.body.user).toBe(userId);
    categoryId = res.body._id;
  });

  it("should get all categories for the user", async () => {
    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Work" });
    const res = await request(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("should update a category", async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Personal Stuff" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Personal Stuff");
  });

  it("should delete a category", async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Category successfully deleted");

    const getRes = await request(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${userToken}`);
    expect(getRes.body.length).toBe(1);
  });

  it("should not create a category with a duplicate name for the same user", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Personal" });

    expect(res.statusCode).toBe(409);
  });
});
