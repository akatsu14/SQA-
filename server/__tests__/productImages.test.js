// Import necessary modules and dependencies
const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
} = require("../controllers/productImages"); // Ensure correct path

// Initialize Prisma client and Express app
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Setup routes for testing
// Note: :id here is treated as productID by the controller
app.get("/api/images/:id", getSingleProductImages);
app.post("/api/images", createImage);
app.put("/api/images/:id", updateImage);
app.delete("/api/images/:id", deleteImage);

// --- Test Data ---
let testProduct;
const testProductSlug_Images = "test-product-for-images";
const testImageName = "test-image.jpg";
const updatedImageName = "updated-image.png";

// --- Setup & Teardown ---
beforeAll(async () => {
  await prisma.$connect();
  // Cleanup old data before running tests
  await prisma.image.deleteMany({});
  await prisma.product.deleteMany({ where: { slug: testProductSlug_Images } });
  await prisma.category.deleteMany({
    where: { name: "Test Category For Images" },
  });

  // Create dependent data (Category -> Product)
  const testCategory = await prisma.category.create({
    data: { name: "Test Category For Images" },
  });
  testProduct = await prisma.product.create({
    data: {
      title: "Image Test Product",
      price: 10.0,
      description: "Product to test images",
      mainImage: "main.jpg",
      slug: testProductSlug_Images,
      manufacturer: "ImgTester",
      inStock: 5,
      categoryId: testCategory.id,
    },
  });

  // Mock console to suppress logs during tests
  global.console.log = jest.fn((message) => {
    /* Suppress logs */
  });
  global.console.error = jest.fn((message) => {
    if (
      !message.includes("Error creating image:") &&
      !message.includes("Error updating image:") &&
      !message.includes("Error deleting image:")
    ) {
      process.stderr.write(message + "\n");
    }
  });
});

afterAll(async () => {
  // Cleanup data after running tests
  await prisma.image.deleteMany({});
  await prisma.product.deleteMany({ where: { id: testProduct?.id } });
  await prisma.category.deleteMany({
    where: { name: "Test Category For Images" },
  });

  await prisma.$disconnect();
  if (global.console.log.mockRestore) global.console.log.mockRestore();
  if (global.console.error.mockRestore) global.console.error.mockRestore();
});

// --- Test Suite ---
describe("Product Images Controller and DB Operations", () => {
  let testImage; // Main test image record

  beforeEach(async () => {
    // Rollback: Ensure no leftover data from previous tests
    await prisma.image.deleteMany({});
    testImage = await prisma.image.create({
      data: {
        productID: testProduct.id,
        image: testImageName,
      },
    });
  });

  afterEach(async () => {
    // Rollback: Clean up any additional records created during tests
    jest.restoreAllMocks();
    await prisma.image.deleteMany({
      where: { NOT: { imageID: testImage?.imageID } },
    });
  });

  // --- Test Cases ---

  // TC-1: Test creating a new image
  // Purpose: Verify that a new image can be created successfully.
  it("TC-1: POST /api/images - should create a new image", async () => {
    const newImageData = {
      productID: testProduct.id,
      image: "new-image.gif",
    };

    // Rollback: Remove the test image created in beforeEach
    await prisma.image.delete({ where: { imageID: testImage.imageID } });

    const response = await request(app).post("/api/images").send(newImageData);

    // Check response
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newImageData);
    expect(response.body.imageID).toBeDefined();

    // Check DB
    const dbRecord = await prisma.image.findUnique({
      where: { imageID: response.body.imageID },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord).toMatchObject(newImageData);
  });

  // TC-2: Test retrieving all images for a product
  // Purpose: Verify that all images for a given productID are retrieved.
  it("TC-2: GET /api/images/:id - should return all images for a given productID", async () => {
    // Create a second image
    await prisma.image.create({
      data: { productID: testProduct.id, image: "second-image.png" },
    });

    // Call GET with productID
    const response = await request(app).get(`/api/images/${testProduct.id}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2); // Should have 2 images

    // Check the first image (from beforeEach)
    expect(
      response.body.some(
        (img) =>
          img.image === testImageName && img.imageID === testImage.imageID
      )
    ).toBe(true);
    // Check the second image
    expect(response.body.some((img) => img.image === "second-image.png")).toBe(
      true
    );
  });

  // TC-3: Test retrieving images for a non-existent product
  // Purpose: Verify that an empty array is returned if no images exist for the productID.
  it("TC-3: GET /api/images/:id - should return 200 and empty array if productID has no images", async () => {
    const nonExistentProductId = "non-existent-product-clx";
    const response = await request(app).get(
      `/api/images/${nonExistentProductId}`
    );

    expect(response.status).toBe(200); // Controller does not return 404 in this case
    expect(response.body).toEqual([]);
  });

  // TC-4: Test updating an image
  // Purpose: Verify that the first image found for the productID can be updated.
  it("TC-4: PUT /api/images/:id - should update the first image found for the productID", async () => {
    const updatedData = {
      productID: testProduct.id, // Typically productID does not change when updating an image
      image: updatedImageName,
    };

    // Call PUT with productID
    const response = await request(app)
      .put(`/api/images/${testProduct.id}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.imageID).toBe(testImage.imageID); // ID remains unchanged
    expect(response.body.image).toBe(updatedImageName);
    expect(response.body.productID).toBe(testProduct.id);

    // Verify DB
    const dbRecord = await prisma.image.findUnique({
      where: { imageID: testImage.imageID },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord.image).toBe(updatedImageName);
  });

  // TC-5: Test deleting all images for a product
  // Purpose: Verify that all images for the given productID are deleted.
  it("TC-5: DELETE /api/images/:id - should delete all images for the given productID", async () => {
    // Create a second image to test deleteMany
    await prisma.image.create({
      data: { productID: testProduct.id, image: "delete-me-too.svg" },
    });

    let imagesBefore = await prisma.image.findMany({
      where: { productID: testProduct.id },
    });
    expect(imagesBefore.length).toBe(2); // Ensure there are 2 images

    // Call DELETE with productID
    const response = await request(app).delete(`/api/images/${testProduct.id}`);

    expect(response.status).toBe(204);

    // Verify DB has no images for this productID
    const imagesAfter = await prisma.image.findMany({
      where: { productID: testProduct.id },
    });
    expect(imagesAfter.length).toBe(0);
  });
});
