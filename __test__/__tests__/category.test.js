// Import necessary modules and initialize app
const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
} = require("../controllers/category");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Setup routes for testing
app.post("/api/categories", createCategory);
app.put("/api/categories/:id", updateCategory);
app.delete("/api/categories/:id", deleteCategory);
app.get("/api/categories/:id", getCategory);
app.get("/api/categories", getAllCategories);

beforeAll(async () => {
  await prisma.$connect();
  // Cleanup test categories before running tests
  await prisma.category.deleteMany({
    where: {
      name: {
        in: ["Test Category", "Updated Category", "Another Test Category"],
      },
    },
  });
  global.console.log = jest.fn((message) => {
    // Suppress unnecessary logs during tests
    if (!message.includes("at Object.log")) {
      process.stdout.write(message + "\n");
    }
  });
});

afterAll(async () => {
  // Cleanup test categories after running tests
  await prisma.category.deleteMany({
    where: {
      name: {
        in: ["Test Category", "Updated Category", "Another Test Category"],
      },
    },
  });
  await prisma.$disconnect();
  global.console.log.mockRestore();
});

describe("Category Controller and DB operations", () => {
  let testCategory;

  beforeEach(async () => {
    // Ensure test category exists before each test
    testCategory = await prisma.category.upsert({
      where: { name: "Test Category" },
      update: {},
      create: {
        name: "Test Category",
      },
    });
  });
  afterEach(async () => {
    // Clean up additional records created during tests
    await prisma.category.deleteMany({
      where: { name: { in: ["Updated Category", "Another Test Category"] } },
    });
  });

  // Test case 1: Verify fetching a category by ID
  it("TCCA01: should return category when id exists and DB record matches expected output", async () => {
    const expectedOutput = {
      name: "Test Category",
    }; // Expected output for the test category
    const response = await request(app).get(
      `/api/categories/${testCategory.id}`
    ); // Fetch the test category by ID
    expect(response.status).toBe(200); // Check if the response status is 200
    expect(response.body).toMatchObject(expectedOutput); // Check if the response body matches the expected output

    const categoryInDb = await prisma.category.findUnique({
      where: { id: testCategory.id },
    }); // Fetch the category from the database
    expect(categoryInDb).not.toBeNull(); // Check if the category exists in the database
    expect(categoryInDb).toMatchObject(expectedOutput); // Check if the category in the database matches the expected output
  });

  // Test case 2: Verify 404 response for non-existent category ID
  it("TCCA02: should return 404 and confirm DB has no record when id does not exist", async () => {
    const nonExistentId = "nonexistent-id";
    const response = await request(app).get(`/api/categories/${nonExistentId}`); // Attempt to fetch a non-existent category
    expect(response.status).toBe(404); // Check if the response status is 404
    expect(response.body).toEqual({ error: "Category not found" }); // and if the error message is as expected

    const categoryInDb = await prisma.category.findUnique({
      where: { id: nonExistentId },
    }); // Check if the category with the non-existent ID is not in the database
    expect(categoryInDb).toBeNull(); // and if the category in the database is null
  });

  // Test case 3: Verify fetching all categories
  it("TCCA03: should get all categories", async () => {
    const response = await request(app).get("/api/categories"); // Fetch all categories
    expect(response.status).toBe(200); // Check if the response status is 200
    expect(Array.isArray(response.body)).toBe(true); // Check if the response body is an array
    expect(response.body.length).toBeGreaterThanOrEqual(1); // Check if the array has at least one category
    expect(response.body.some((cat) => cat.name === "Test Category")).toBe(
      true
    ); // Check if the test category is in the response
  });

  // Test case 4: Verify creating a new category
  it("TCCA04: should create a new category", async () => {
    const newCategory = { name: "Another Test Category" }; // New category data
    const response = await request(app)
      .post("/api/categories")
      .send(newCategory); // Create a new category
    expect(response.status).toBe(201); // Check if the response status is 201
    expect(response.body).toMatchObject(newCategory); // Check if the response body matches the new category data

    const categoryInDb = await prisma.category.findUnique({
      where: { id: response.body.id },
    }); // Fetch the new category from the database
    expect(categoryInDb).not.toBeNull(); // Check if the category exists in the database
    expect(categoryInDb).toMatchObject(newCategory); // Check if the category in the database matches the new category data
  });

  // Test case 5: Verify updating an existing category
  it("TCCA05: should update a category", async () => {
    const updatedData = { name: "Updated Category" }; // Updated category data
    const response = await request(app)
      .put(`/api/categories/${testCategory.id}`)
      .send(updatedData); // Update the test category
    expect(response.status).toBe(200); // Check if the response status is 200
    expect(response.body).toMatchObject(updatedData); // Check if the response body matches the updated category data

    const categoryInDb = await prisma.category.findUnique({
      where: { id: testCategory.id },
    }); // Fetch the updated category from the database
    expect(categoryInDb).not.toBeNull(); // Check if the category exists in the database
    expect(categoryInDb.name).toBe(updatedData.name); // Check if the category name in the database matches the updated name
  });

  // Test case 6: Verify 404 response for updating non-existent category
  it("TCCA06: should return 404 when updating non-existent category", async () => {
    const nonExistentId = "nonexistent-id"; // Non-existent category ID
    const updatedData = { name: "Updated Category" }; // Updated category data
    const response = await request(app)
      .put(`/api/categories/${nonExistentId}`)
      .send(updatedData); // Attempt to update a non-existent category

    expect(response.status).toBe(404); // Check if the response status is 404
    expect(response.body).toEqual({ error: "Category not found" }); // Check if the error message is as expected
  });

  // Test case 7: Verify deleting a category
  it("TCCA07: should delete a category", async () => {
    const categoryToDelete = await prisma.category.create({
      data: {
        name: "Category To Delete",
      },
    }); // Create a category to delete

    const response = await request(app).delete(
      `/api/categories/${categoryToDelete.id}`
    ); // Delete the category
    expect(response.status).toBe(204); // Check if the response status is 204 (No Content)

    const categoryInDb = await prisma.category.findUnique({
      where: { id: categoryToDelete.id },
    }); // Fetch the deleted category from the database
    expect(categoryInDb).toBeNull(); // Check if the category no longer exists in the database
  });

  // Test case 8: Verify adding, updating, and deleting a record in the DB
  it("TCCA08: should correctly add, update, and delete a record in the DB", async () => {
    const addedCategory = await prisma.category.create({
      data: {
        name: "Add Test Category",
      },
    }); // Create a new category for testing
    let categoryInDb = await prisma.category.findUnique({
      where: { id: addedCategory.id },
    }); // Fetch the added category from the database
    expect(categoryInDb).not.toBeNull(); // Check if the category exists in the database
    expect(categoryInDb).toMatchObject({
      name: "Add Test Category",
    }); // Check if the category name matches the expected value

    await prisma.category.update({
      where: { id: addedCategory.id },
      data: { name: "Updated Test Category" },
    }); // Update the category name
    categoryInDb = await prisma.category.findUnique({
      where: { id: addedCategory.id },
    }); // Fetch the updated category from the database
    expect(categoryInDb).not.toBeNull(); // Check if the category exists in the database
    expect(categoryInDb.name).toBe("Updated Test Category"); // Check if the category name matches the updated value

    await prisma.category.delete({ where: { id: addedCategory.id } }); // Delete the category

    categoryInDb = await prisma.category.findUnique({
      where: { id: addedCategory.id },
    }); // Fetch the deleted category from the database
    expect(categoryInDb).toBeNull(); // Check if the category no longer exists in the database
  });
  it("TCCA09: should return 409 if creating a category with duplicate name", async () => {
    // Tạo category đầu tiên
    await prisma.category.create({ data: { name: "Unique Category" } });

    // Thử tạo lại với cùng tên
    const response = await request(app)
      .post("/api/categories")
      .send({ name: "Unique Category" });

    expect([400, 409]).toContain(response.status);
    expect(response.body).toHaveProperty("error");
  });
  it("TCCA10: should return 400 if creating a category with missing name", async () => {
    const response = await request(app).post("/api/categories").send({}); // Không có trường name

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
  it("TCCA11: should return 409 if updating a category to a name that already exists", async () => {
    // Tạo 2 category khác nhau
    const catA = await prisma.category.create({ data: { name: "CatA" } });
    const catB = await prisma.category.create({ data: { name: "CatB" } });

    // Thử update catB thành tên catA
    const response = await request(app)
      .put(`/api/categories/${catB.id}`)
      .send({ name: "CatA" });

    expect([400, 409]).toContain(response.status);
    expect(response.body).toHaveProperty("error");
  });
  it("TCCA12: should return 404 when deleting a non-existent category", async () => {
    const response = await request(app).delete(
      "/api/categories/nonexistent-id"
    );
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Category not found" });
  });
  it("TCCA13: should return 400 when getting a category with invalid ID format", async () => {
    const response = await request(app).get(
      "/api/categories/invalid-id-format"
    );
    expect([400, 404]).toContain(response.status); // Tùy vào middleware validate
  });
  it("TCCA14: should return empty array when there are no categories", async () => {
    // Xóa hết category
    await prisma.category.deleteMany({});
    const response = await request(app).get("/api/categories");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});
