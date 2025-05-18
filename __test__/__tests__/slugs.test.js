// __tests__/slugs.test.js

const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { getProductBySlug } = require("../controllers/slugs");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get("/api/slugs/:slug", getProductBySlug);

// === Dữ Liệu Test (Chỉ dùng các trường có trong Schema) ===
const testCategoryName = "Test Category for Slug Test v2"; // Đổi tên để tránh xung đột cũ
// const testProductName = "Awesome Test Product"; // <-- LOẠI BỎ
const testProductTitle = "The Actual Test Product Title v2"; // <-- Đây là trường chính
const testProductSlug = "actual-test-product-slug-v2";
const testProductMainImage = "/images/actual-test-v2.png";
const testProductDescription = "Description for the actual test product v2.";
const testProductManufacturer = "ActualTest Manu v2";
const testProductPrice = 25000; // Giá Int
const testProductInStock = 30; // Số lượng tồn kho
const testProductRating = 4; // Rating

const nonExistentSlug = "this-slug-definitely-does-not-exist";
// === Kết Thúc Dữ Liệu Test ===

beforeAll(async () => {
  await prisma.$connect();
  await prisma.product.deleteMany({ where: { slug: testProductSlug } });
  await prisma.category.deleteMany({ where: { name: testCategoryName } });
});

afterAll(async () => {
  try {
    await prisma.product.deleteMany({ where: { slug: testProductSlug } });
    await prisma.category.deleteMany({ where: { name: testCategoryName } });
  } catch (error) {
    console.error("Error during afterAll cleanup:", error);
  }
  await prisma.$disconnect();
});

describe("Slug Controller (getProductBySlug) - Corrected Schema", () => {
  let testCategory;
  let testProduct;

  beforeEach(async () => {
    // 1. Tạo Category
    testCategory = await prisma.category.upsert({
      where: { name: testCategoryName },
      update: {},
      create: { name: testCategoryName },
    });

    // 2. Tạo Product
    testProduct = await prisma.product.upsert({
      where: { slug: testProductSlug },
      update: {
        title: testProductTitle,
        mainImage: testProductMainImage,
        description: testProductDescription,
        manufacturer: testProductManufacturer,
        price: testProductPrice,
        inStock: testProductInStock,
        rating: testProductRating,
        categoryId: testCategory.id,
      },
      create: {
        slug: testProductSlug,
        title: testProductTitle,
        mainImage: testProductMainImage,
        description: testProductDescription,
        manufacturer: testProductManufacturer,
        price: testProductPrice,
        inStock: testProductInStock,
        rating: testProductRating,
        categoryId: testCategory.id,
      },
      include: { category: true },
    });
  });

  it("TCSL01: should return product details (using title) when slug exists", async () => {
    const response = await request(app).get(`/api/slugs/${testProductSlug}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(testProduct.id);
    expect(response.body.slug).toBe(testProductSlug);
    expect(response.body.title).toBe(testProductTitle);
    expect(response.body.mainImage).toBe(testProductMainImage);
    expect(response.body.description).toBe(testProductDescription);
    expect(response.body.manufacturer).toBe(testProductManufacturer);
    expect(response.body.price).toBe(testProductPrice);
    expect(response.body.inStock).toBe(testProductInStock);
    expect(response.body.rating).toBe(testProductRating);
    expect(response.body.categoryId).toBe(testCategory.id);

    expect(response.body.category).toBeDefined();
    expect(response.body.category.id).toBe(testCategory.id);
    expect(response.body.category.name).toBe(testCategoryName); // Category vẫn có trường name

    const productInDb = await prisma.product.findUnique({
      where: { slug: testProductSlug },
    });
    expect(productInDb).not.toBeNull();
    expect(productInDb.title).toBe(testProductTitle); // Xác nhận title trong DB
  });

  it("TCSL02: should return 404 Not Found when slug does not exist", async () => {
    const response = await request(app).get(`/api/slugs/${nonExistentSlug}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Product not found" });

    const productInDb = await prisma.product.findUnique({
      where: { slug: nonExistentSlug },
    });
    expect(productInDb).toBeNull();
  });
});
