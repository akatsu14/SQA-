// Import necessary modules and dependencies
const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  getCustomerOrder,
  getAllOrders,
} = require("../controllers/customer_orders"); // Ensure this path is correct

// Initialize Prisma Client and Express app
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Setup routes for testing (similar to app.js but only for orders)
app.post("/api/orders", createCustomerOrder);
app.put("/api/orders/:id", updateCustomerOrder);
app.delete("/api/orders/:id", deleteCustomerOrder);
app.get("/api/orders/:id", getCustomerOrder);
app.get("/api/orders", getAllOrders);

// List of test emails used in tests for cleanup
const testEmails = [
  "test.order@example.com",
  "updated.order@example.com",
  "another.order@example.com",
  "delete.order@example.com",
  "add.test@example.com",
];

// Before all tests, connect to the database and clean up test data
beforeAll(async () => {
  await prisma.$connect(); // Establish database connection
  // Cleanup test orders before starting
  await prisma.customer_order.deleteMany({
    where: {
      email: {
        in: testEmails,
      },
    },
  });
  // Mock console.log to suppress unnecessary logs during tests
  global.console.log = jest.fn((message) => {
    if (
      !message.includes("at Object.log") &&
      !message.includes("Error creating order") &&
      !message.includes("Error updating order") &&
      !message.includes("Error deleting order") &&
      !message.includes("Error fetching orders")
    ) {
      process.stdout.write(message + "\n");
    }
  });
});

// After all tests, clean up test data and disconnect from the database
afterAll(async () => {
  await prisma.customer_order.deleteMany({
    where: {
      email: {
        in: testEmails,
      },
    },
  });
  await prisma.$disconnect(); // Disconnect from the database
  global.console.log.mockRestore(); // Restore console.log
});

// Test suite for Customer Order Controller and DB operations
describe("Customer Order Controller and DB operations", () => {
  let testOrder; // Variable to store the test order created for each test

  // Sample data for a test order
  const sampleOrderData = {
    name: "Test",
    lastname: "Order",
    phone: "1234567890",
    email: "test.order@example.com", // Email used for creating/deleting in beforeEach
    company: "Test Inc.",
    adress: "123 Test St",
    apartment: "Apt 4B",
    postalCode: "10001",
    status: "Pending",
    city: "Test City",
    country: "Testland",
    orderNotice: "Handle with care",
    total: 150,
  };

  // Before each test, ensure a clean state by deleting and recreating the test order
  beforeEach(async () => {
    await prisma.customer_order.deleteMany({
      where: { email: sampleOrderData.email },
    });
    testOrder = await prisma.customer_order.create({
      data: sampleOrderData,
    });
  });

  // After each test, clean up any additional test data created during the test
  afterEach(async () => {
    await prisma.customer_order.deleteMany({
      where: {
        email: {
          in: ["updated.order@example.com", "another.order@example.com"],
        },
      },
    });
  });

  // Test Case 2.3.1: Verify fetching an order by ID
  it("TC01: should return order when id exists and DB record matches expected output", async () => {
    // Expected output should match the sample order data
    const expectedOutput = {
      ...sampleOrderData,
    };

    // Send GET request to fetch the order by ID
    const response = await request(app).get(`/api/orders/${testOrder.id}`);
    expect(response.status).toBe(200); // Expect HTTP 200 OK
    expect(response.body).toMatchObject(expectedOutput); // Verify response matches expected data
    expect(response.body.id).toBe(testOrder.id); // Verify ID matches
    expect(response.body.dateTime).not.toBeNull(); // Ensure dateTime is not null

    // Verify directly in the database
    const orderInDb = await prisma.customer_order.findUnique({
      where: { id: testOrder.id },
    });
    expect(orderInDb).not.toBeNull(); // Ensure order exists in DB
    expect(orderInDb).toMatchObject(expectedOutput); // Verify DB record matches expected data
  });

  // Test Case 2.3.2: Verify 404 response for non-existent order ID
  it("TC02: should return 404 and confirm DB has no record when id does not exist", async () => {
    const nonExistentId = "clxxxxxxxxxxxxxxxxxx"; // Non-existent ID
    const response = await request(app).get(`/api/orders/${nonExistentId}`);
    expect(response.status).toBe(404); // Expect HTTP 404 Not Found
    expect(response.body).toEqual({ error: "Order not found" }); // Verify error message

    // Verify directly in the database
    const orderInDb = await prisma.customer_order.findUnique({
      where: { id: nonExistentId },
    });
    expect(orderInDb).toBeNull(); // Ensure no record exists in DB
  });

  // Test Case 2.3.3: Verify fetching all orders
  it("TC03: should get all orders", async () => {
    const response = await request(app).get("/api/orders");
    expect(response.status).toBe(200); // Expect HTTP 200 OK
    expect(Array.isArray(response.body)).toBe(true); // Verify response is an array
    expect(response.body.length).toBeGreaterThanOrEqual(1); // Ensure at least one order exists
    expect(
      response.body.some((order) => order.email === sampleOrderData.email)
    ).toBe(true); // Verify the test order is in the list
  });

  // Test Case 2.3.4: Verify creating a new order
  it("TC04: should create a new order", async () => {
    const newOrderData = {
      ...sampleOrderData,
      email: "another.order@example.com", // Use a different email for the new order
      name: "Another",
      lastname: "Tester",
      total: 200.0,
    };
    const response = await request(app).post("/api/orders").send(newOrderData);

    expect(response.status).toBe(201); // Expect HTTP 201 Created
    expect(response.body).toMatchObject(newOrderData); // Verify response matches new order data
    expect(response.body.id).toBeDefined(); // Ensure ID is defined
    expect(response.body.dateTime).toBeDefined(); // Ensure dateTime is defined

    // Verify directly in the database
    const orderInDb = await prisma.customer_order.findUnique({
      where: { id: response.body.id },
    });
    expect(orderInDb).not.toBeNull(); // Ensure order exists in DB
    expect(orderInDb).toMatchObject(newOrderData); // Verify DB record matches new order data
  });

  // Test Case 2.3.5: Verify updating an order
  it("TC05: should update an order", async () => {
    const updatedData = {
      ...sampleOrderData,
      status: "Shipped", // Update status to "Shipped"
      total: 160.0, // Update total amount
      email: "updated.order@example.com", // Update email
    };
    const response = await request(app)
      .put(`/api/orders/${testOrder.id}`)
      .send(updatedData);

    expect(response.status).toBe(200); // Expect HTTP 200 OK
    expect(response.body.status).toBe(updatedData.status); // Verify updated status
    expect(response.body.total).toBe(updatedData.total); // Verify updated total
    expect(response.body.email).toBe(updatedData.email); // Verify updated email

    // Verify directly in the database
    const orderInDb = await prisma.customer_order.findUnique({
      where: { id: testOrder.id },
    });
    expect(orderInDb).not.toBeNull(); // Ensure order exists in DB
    expect(orderInDb.status).toBe(updatedData.status); // Verify DB record updated status
    expect(orderInDb.total).toBe(updatedData.total); // Verify DB record updated total
    expect(orderInDb.email).toBe(updatedData.email); // Verify DB record updated email
  });

  // Test Case 2.3.6: Verify 404 response when updating non-existent order
  it("TC06: should return 404 when updating non-existent order", async () => {
    const nonExistentId = "clxxxxxxxxxxxxxxxxxx"; // Non-existent ID
    const updatedData = { status: "Cancelled" }; // Update data
    const response = await request(app)
      .put(`/api/orders/${nonExistentId}`)
      .send(updatedData);

    expect(response.status).toBe(404); // Expect HTTP 404 Not Found
    expect(response.body).toEqual({ error: "Order not found" }); // Verify error message
  });

  // Test Case 2.3.7: Verify deleting an order
  it("TC07: should delete an order", async () => {
    const orderToDeleteData = {
      ...sampleOrderData,
      email: "delete.order@example.com", // Use a different email for the order to delete
      name: "Delete",
      lastname: "Me",
    };
    const orderToDelete = await prisma.customer_order.create({
      data: orderToDeleteData,
    });

    const response = await request(app).delete(
      `/api/orders/${orderToDelete.id}`
    );
    expect(response.status).toBe(204); // Expect HTTP 204 No Content

    // Verify directly in the database
    const orderInDb = await prisma.customer_order.findUnique({
      where: { id: orderToDelete.id },
    });
    expect(orderInDb).toBeNull(); // Ensure order is deleted from DB
  });

  // Test Case 2.3.8: Verify adding, updating, and deleting a record in the DB
  it("TC08: should correctly add, update, and delete a record in the DB", async () => {
    const addTestData = {
      ...sampleOrderData,
      email: "add.test@example.com", // Use a different email for the added order
      name: "Add",
      lastname: "TestOrder",
    };

    // Add a new order to the database
    const addedOrder = await prisma.customer_order.create({
      data: addTestData,
    });

    // Verify the added order exists in the database
    let orderInDb = await prisma.customer_order.findUnique({
      where: { id: addedOrder.id },
    });
    expect(orderInDb).not.toBeNull(); // Ensure order exists in DB
    expect(orderInDb).toMatchObject({
      name: "Add",
      lastname: "TestOrder",
      email: "add.test@example.com",
    });

    // Update the added order in the database
    await prisma.customer_order.update({
      where: { id: addedOrder.id },
      data: { status: "Processing", total: 55 },
    });

    // Verify the updated order exists in the database
    orderInDb = await prisma.customer_order.findUnique({
      where: { id: addedOrder.id },
    });
    expect(orderInDb).not.toBeNull(); // Ensure order exists in DB
    expect(orderInDb.status).toBe("Processing"); // Verify updated status
    expect(orderInDb.total).toBe(55); // Verify updated total

    // Delete the updated order from the database
    await prisma.customer_order.delete({ where: { id: addedOrder.id } });

    // Verify the deleted order no longer exists in the database
    orderInDb = await prisma.customer_order.findUnique({
      where: { id: addedOrder.id },
    });
    expect(orderInDb).toBeNull(); // Ensure order is deleted from DB
  });
});
