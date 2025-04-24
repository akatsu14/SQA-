/**
 * Test Case Documentation
 *
 * | **File Name**                  | **Class/Function**         | **Test Case ID** | **Purpose**                                                                 | **Input**                                                                 | **Expected Output**                                                                 | **Notes**                                                                 |
 * |--------------------------------|----------------------------|------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
 * | `category.test.js`             | `getCategory`             | TC01             | Verify that a category is returned when the ID exists.                      | Category ID (`testCategory.id`)                                           | 200 status, response contains the category data, and the category exists in the database. | Verifies database state matches the expected output.                     |
 * | `category.test.js`             | `getCategory`             | TC02             | Verify that a 404 error is returned for a non-existent category ID.         | Non-existent Category ID (`"nonexistent-id"`)                             | 404 status, response contains `{ error: "Category not found" }`, and no record exists in the database. | Ensures proper handling of non-existent IDs.                             |
 * | `category.test.js`             | `getAllCategories`        | TC03             | Verify that all categories are retrieved successfully.                      | No input                                                                  | 200 status, response contains an array of categories, and the array includes the test category. | Verifies the response includes all categories in the database.           |
 * | `category.test.js`             | `createCategory`          | TC04             | Verify that a new category can be created successfully.                     | New category data (`{ name: "Another Test Category" }`)                   | 201 status, response contains the created category data, and the category exists in the database. | Verifies database state after creation.                                  |
 * | `category.test.js`             | `updateCategory`          | TC05             | Verify that an existing category can be updated successfully.               | Category ID (`testCategory.id`), updated data (`{ name: "Updated Category" }`) | 200 status, response contains the updated category data, and the database reflects the updated name. | Verifies database state after update.                                    |
 * | `category.test.js`             | `updateCategory`          | TC06             | Verify that a 404 error is returned when updating a non-existent category.  | Non-existent Category ID (`"nonexistent-id"`), updated data (`{ name: "Updated Category" }`) | 404 status, response contains `{ error: "Category not found" }`.                     | Ensures proper handling of non-existent IDs during update.               |
 * | `category.test.js`             | `deleteCategory`          | TC07             | Verify that a category can be deleted successfully.                         | Category ID (`categoryToDelete.id`)                                       | 204 status, no content in response, and the category no longer exists in the database. | Verifies database state after deletion.                                  |
 * | `category.test.js`             | `createCategory`, `updateCategory`, `deleteCategory` | TC08 | Verify adding, updating, and deleting a record in the database.             | New category data (`{ name: "Add Test Category" }`), updated data (`{ name: "Updated Test Category" }`) | Category is created, updated, and deleted successfully, with the database reflecting the correct state at each step. | Comprehensive test for CRUD operations.                                  |
 */

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
  it("TC01: should return category when id exists and DB record matches expected output", async () => {
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
  it("TC02: should return 404 and confirm DB has no record when id does not exist", async () => {
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
  it("TC03: should get all categories", async () => {
    const response = await request(app).get("/api/categories"); // Fetch all categories
    expect(response.status).toBe(200); // Check if the response status is 200
    expect(Array.isArray(response.body)).toBe(true); // Check if the response body is an array
    expect(response.body.length).toBeGreaterThanOrEqual(1); // Check if the array has at least one category
    expect(response.body.some((cat) => cat.name === "Test Category")).toBe(
      true
    ); // Check if the test category is in the response
  });

  // Test case 4: Verify creating a new category
  it("TC04: should create a new category", async () => {
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
  it("TC05: should update a category", async () => {
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
  it("TC06: should return 404 when updating non-existent category", async () => {
    const nonExistentId = "nonexistent-id"; // Non-existent category ID
    const updatedData = { name: "Updated Category" }; // Updated category data
    const response = await request(app)
      .put(`/api/categories/${nonExistentId}`)
      .send(updatedData); // Attempt to update a non-existent category

    expect(response.status).toBe(404); // Check if the response status is 404
    expect(response.body).toEqual({ error: "Category not found" }); // Check if the error message is as expected
  });

  // Test case 7: Verify deleting a category
  it("TC07: should delete a category", async () => {
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
  it("TC08: should correctly add, update, and delete a record in the DB", async () => {
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
});
