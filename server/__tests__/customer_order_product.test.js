// Import necessary modules and dependencies
const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  createOrderProduct,
  updateProductOrder,
  deleteProductOrder,
  getProductOrder,
  getAllProductOrders,
} = require("../controllers/customer_order_product"); // Ensure correct path

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Setup routes for testing
app.post("/api/order-product", createOrderProduct);
app.put("/api/order-product/:id", updateProductOrder);
app.delete("/api/order-product/:id", deleteProductOrder);
app.get("/api/order-product/:id", getProductOrder);
app.get("/api/order-product", getAllProductOrders);

// --- Fixed Test Data ---
let testCustomerOrder; // Holds the test customer order record
let testProduct; // Holds the test product record
const testOrderEmail = "order.for.product@test.com"; // Email for the test customer order
const testProductSlug = "test-product-for-order"; // Slug for the test product

// --- Setup & Teardown ---
beforeAll(async () => {
  await prisma.$connect(); // Connect to the database

  // Clean up old data to avoid conflicts
  await prisma.customer_order_product.deleteMany({});
  await prisma.customer_order.deleteMany({ where: { email: testOrderEmail } });
  await prisma.product.deleteMany({ where: { slug: testProductSlug } });
  await prisma.category.deleteMany({
    where: { name: "Test Category For Product" },
  });

  // Create dependent data (Category -> Product -> CustomerOrder)
  const testCategory = await prisma.category.create({
    data: { name: "Test Category For Product" },
  });

  testProduct = await prisma.product.create({
    data: {
      title: "Test Product",
      price: 99.99,
      description: "Test product description",
      mainImage: "test.jpg",
      slug: testProductSlug,
      manufacturer: "Tester",
      inStock: 10,
      categoryId: testCategory.id, // Use ID of the created category
    },
  });

  testCustomerOrder = await prisma.customer_order.create({
    data: {
      name: "Order",
      lastname: "Test",
      phone: "9876543210",
      email: testOrderEmail,
      adress: "456 Test Ave",
      postalCode: "90210",
      status: "Pending",
      city: "Testville",
      country: "Testland",
      total: 199.98,
      company: "Test Company",
      apartment: "Apt 1",
      dateTime: new Date(),
    },
  });

  // Mock console.log to suppress unnecessary logs during tests
  global.console.log = jest.fn((message) => {
    if (
      !message.includes("at Object.log") &&
      !message.includes("Error creating prodcut order:") &&
      !message.includes("Error updating order") &&
      !message.includes("Error deleting product orders") &&
      !message.includes("Error fetching all product orders:")
    ) {
      process.stdout.write(message + "\n");
    }
  });

  // Mock console.error to suppress unnecessary error logs during tests
  global.console.error = jest.fn((message) => {
    if (
      !message.includes("Error creating prodcut order:") &&
      !message.includes("Error fetching all product orders:")
    ) {
      process.stderr.write(message + "\n");
    }
  });
});

afterAll(async () => {
  // Clean up test data after all tests
  await prisma.customer_order_product.deleteMany({});
  await prisma.customer_order.deleteMany({
    where: { id: testCustomerOrder?.id },
  });
  await prisma.product.deleteMany({ where: { id: testProduct?.id } });
  await prisma.category.deleteMany({
    where: { name: "Test Category For Product" },
  });

  await prisma.$disconnect(); // Disconnect from the database
  if (global.console.log.mockRestore) global.console.log.mockRestore();
  if (global.console.error.mockRestore) global.console.error.mockRestore();
});

// --- Test Suite ---
describe("Customer Order Product Controller and DB Operations", () => {
  let testOrderProduct; // Holds the test order-product link record

  // Helper function to generate sample data for creating a new order-product link
  const sampleOrderProductData = () => ({
    customerOrderId: testCustomerOrder.id,
    productId: testProduct.id,
    quantity: 2,
  });

  beforeEach(async () => {
    // Create a new record for each test case
    await prisma.customer_order_product.deleteMany({});
    testOrderProduct = await prisma.customer_order_product.create({
      data: sampleOrderProductData(),
    });
  });

  afterEach(async () => {
    // Clean up mocks and test data after each test
    jest.restoreAllMocks();
    await prisma.customer_order_product.deleteMany({
      where: { NOT: { id: testOrderProduct?.id } },
    });
  });

  // --- Test Cases ---

  // Test Case ID: TCCOP01
  // Objective: Verify that a new order-product link can be created successfully
  it("TCCOP01: POST /api/order-product - should create a new order-product link", async () => {
    const newLinkData = {
      customerOrderId: testCustomerOrder.id,
      productId: testProduct.id,
      quantity: 5,
    };

    // Delete the existing record to test creation
    await prisma.customer_order_product.delete({
      where: { id: testOrderProduct.id },
    });

    const response = await request(app)
      .post("/api/order-product")
      .send(newLinkData);

    expect(response.status).toBe(201); // Check if the response status is 201 (Created)
    expect(response.body).toMatchObject(newLinkData); // Check if the response body matches the input data
    expect(response.body.id).toBeDefined(); // Check if the created record has an ID

    // Verify the record in the database
    const dbRecord = await prisma.customer_order_product.findUnique({
      where: { id: response.body.id },
    });
    expect(dbRecord).not.toBeNull(); // Ensure the record exists in the database
    expect(dbRecord).toMatchObject(newLinkData); // Ensure the record matches the input data
  });

  // Test Case ID: TCCOP02
  // Objective: Verify that an existing order-product link can be updated successfully
  it("TCCOP02: PUT /api/order-product/:id - should update an existing order-product link", async () => {
    const updatedData = {
      customerOrderId: testOrderProduct.customerOrderId,
      productId: testOrderProduct.productId,
      quantity: 10,
    };

    const response = await request(app)
      .put(`/api/order-product/${testOrderProduct.id}`)
      .send(updatedData);

    expect(response.status).toBe(200); // Check if the response status is 200 (OK)
    expect(response.body.quantity).toBe(updatedData.quantity); // Check if the quantity is updated
    expect(response.body.id).toBe(testOrderProduct.id); // Check if the ID remains the same

    // Verify the updated record in the database
    const dbRecord = await prisma.customer_order_product.findUnique({
      where: { id: testOrderProduct.id },
    });
    expect(dbRecord).not.toBeNull(); // Ensure the record exists in the database
    expect(dbRecord.quantity).toBe(updatedData.quantity); // Ensure the quantity is updated in the database
  });

  // Test Case ID: TCCOP03
  // Objective: Verify that updating a non-existent order-product link returns a 404 error
  it("TCCOP03: PUT /api/order-product/:id - should return 404 if order-product link not found", async () => {
    const nonExistentId = "clxxxxxxxxxxxxxxxxxx"; // Non-existent ID
    const updatedData = { quantity: 1 };

    const response = await request(app)
      .put(`/api/order-product/${nonExistentId}`)
      .send(updatedData);

    expect(response.status).toBe(404); // Check if the response status is 404 (Not Found)
    expect(response.body).toEqual({ error: "Order not found" }); // Check if the error message is as expected
  });

  // Test Case ID: TCCOP04
  // Objective: Verify that all links for a given customerOrderId can be deleted successfully
  it("TCCOP04: DELETE /api/order-product/:id - should delete all links for a given customerOrderId", async () => {
    await prisma.customer_order_product.create({
      data: {
        customerOrderId: testCustomerOrder.id,
        productId: testProduct.id,
        quantity: 1,
      },
    });

    // Create another order-product link for the same customerOrderId
    let recordsBefore = await prisma.customer_order_product.findMany({
      where: { customerOrderId: testCustomerOrder.id },
    });
    expect(recordsBefore.length).toBe(2); // Ensure there are two records before deletion

    // Delete all records for the customerOrderId
    const response = await request(app).delete(
      `/api/order-product/${testCustomerOrder.id}`
    );

    expect(response.status).toBe(204); // Check if the response status is 204 (No Content)

    // Verify that all records for the customerOrderId are deleted
    const recordsAfter = await prisma.customer_order_product.findMany({
      where: { customerOrderId: testCustomerOrder.id },
    });
    expect(recordsAfter.length).toBe(0); // Ensure all records are deleted
  });

  // Test Case ID: TCCOP05
  // Objective: Verify that all product links for a given customerOrderId can be retrieved successfully
  it("TCCOP05: GET /api/order-product/:id - should return all product links for a given customerOrderId", async () => {
    // Create a new order-product link for testing
    const response = await request(app).get(
      `/api/order-product/${testCustomerOrder.id}`
    );
    expect(response.status).toBe(200); // Check if the response status is 200 (OK)
    expect(Array.isArray(response.body)).toBe(true); // Check if the response body is an array
    expect(response.body.length).toBe(1); // Check if the array contains one record

    // Check the first record in the response
    const receivedRecord = response.body[0];
    expect(receivedRecord.customerOrderId).toBe(testCustomerOrder.id); // Check if the customerOrderId matches
    expect(receivedRecord.productId).toBe(testProduct.id); // Check if the productId matches
    expect(receivedRecord.quantity).toBe(testOrderProduct.quantity); // Check if the quantity matches
    expect(receivedRecord.product).toBeDefined(); // Check if the product details are included
    expect(receivedRecord.product.id).toBe(testProduct.id); // Check if the product ID matches
    expect(receivedRecord.product.title).toBe(testProduct.title); // Check if the product title matches
  });

  // Test Case ID: TCCOP06
  // Objective: Verify that retrieving product links for a non-existent customerOrderId returns an empty array
  it("TCCOP06: GET /api/order-product/:id - should return 200 and empty array if customerOrderId not found", async () => {
    const nonExistentOrderId = "clxxxxxxxxxxxxxxxxxx"; // Non-existent customerOrderId
    const response = await request(app).get(
      `/api/order-product/${nonExistentOrderId}`
    );

    expect(response.status).toBe(200); // Check if the response status is 200 (OK)
    expect(response.body).toEqual([]); // Check if the response body is an empty array
  });

  // Test Case ID: TCCOP07
  // Objective: Verify that all orders are grouped by customer with product details
  it("TCCOP07: GET /api/order-product - should return all orders grouped by customer with product details", async () => {
    const anotherOrder = await prisma.customer_order.create({
      data: {
        name: "Another",
        lastname: "Order",
        email: "another.order@test.com",
        adress: "789 St",
        postalCode: "11111",
        status: "Shipped",
        city: "City",
        country: "Country",
        total: 50,
        company: "Another Company",
        apartment: "Apt 2",
        phone: "1234567890",
        dateTime: new Date(),
      },
    });
    const anotherProduct = await prisma.product.create({
      data: {
        title: "Another Prod",
        price: 25,
        slug: "another-prod",
        categoryId: testProduct.categoryId,
        mainImage: "a.jpg",
        description: "desc",
        manufacturer: "manu",
        inStock: 5,
      },
    });
    await prisma.customer_order_product.create({
      data: {
        customerOrderId: anotherOrder.id,
        productId: anotherProduct.id,
        quantity: 1,
      },
    });
    await prisma.customer_order_product.create({
      data: {
        customerOrderId: testCustomerOrder.id,
        productId: anotherProduct.id,
        quantity: 3,
      },
    });

    // Fetch all order-product links
    const response = await request(app).get("/api/order-product");

    expect(response.status).toBe(200); // Check if the response status is 200 (OK)
    expect(Array.isArray(response.body)).toBe(true); // Check if the response body is an array
    expect(response.body.length).toBe(2); // Check if the array contains two groups

    // Check the first order group
    const firstOrderGroup = response.body.find(
      (g) => g.customerOrderId === testCustomerOrder.id
    );
    expect(firstOrderGroup).toBeDefined(); // Check if the first order group exists
    expect(firstOrderGroup.customerOrder.email).toBe(testOrderEmail); // Check if the email matches
    expect(Array.isArray(firstOrderGroup.products)).toBe(true); // Check if the products are an array
    expect(firstOrderGroup.products.length).toBe(2); // Check if the array contains two products

    // Check the products in the first order group
    const firstProductInFirstOrder = firstOrderGroup.products.find(
      (p) => p.id === testProduct.id
    );
    expect(firstProductInFirstOrder).toBeDefined(); // Check if the first product exists
    expect(firstProductInFirstOrder.title).toBe(testProduct.title); // Check if the title matches
    expect(firstProductInFirstOrder.quantity).toBe(testOrderProduct.quantity); // Check if the quantity matches

    // Check the second product in the first order group
    const secondProductInFirstOrder = firstOrderGroup.products.find(
      (p) => p.id === anotherProduct.id
    );
    expect(secondProductInFirstOrder).toBeDefined(); // Check if the second product exists
    expect(secondProductInFirstOrder.title).toBe(anotherProduct.title); // Check if the title matches
    expect(secondProductInFirstOrder.quantity).toBe(3); // Check if the quantity matches

    // Check the second order group
    const secondOrderGroup = response.body.find(
      (g) => g.customerOrderId === anotherOrder.id
    );
    expect(secondOrderGroup).toBeDefined(); // Check if the second order group exists
    expect(secondOrderGroup.customerOrder.email).toBe("another.order@test.com"); // Check if the email matches
    expect(secondOrderGroup.products.length).toBe(1); // Check if the array contains one product
    expect(secondOrderGroup.products[0].id).toBe(anotherProduct.id); // Check if the product ID matches
    expect(secondOrderGroup.products[0].quantity).toBe(1); // Check if the quantity matches

    // Clean up the additional records created for this test
    await prisma.customer_order_product.deleteMany({
      where: { customerOrderId: anotherOrder.id },
    });
    await prisma.customer_order_product.deleteMany({
      where: {
        customerOrderId: testCustomerOrder.id,
        productId: anotherProduct.id,
      },
    });
    await prisma.customer_order.delete({ where: { id: anotherOrder.id } });
    await prisma.product.delete({ where: { id: anotherProduct.id } });
  });
});
