const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  getUserByEmail,
  createUser,
  deleteUser,
  updateUser,
} = require("../controllers/users");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.get("/api/users/email/:email", getUserByEmail);

beforeAll(async () => {
  await prisma.$connect();
  // Ensure no test users conflict
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["test@example.com", "updated@example.com", "addtest@example.com"],
      },
    },
  });
  global.console.log = jest.fn((message) => {
    // Chỉ log những thông điệp không chứa "at Object"
    if (!message.includes("at Object.log")) {
      process.stdout.write(message + "\n");
    }
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["test@example.com", "updated@example.com", "addtest@example.com"],
      },
    },
  });
  await prisma.$disconnect();
  global.console.log.mockRestore();
});

describe("getUserByEmail and DB operations", () => {
  let testUser;

  beforeEach(async () => {
    // Add test user if not exists
    testUser = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        password: "hashedpassword",
        role: "user",
      },
    });
  });

  afterEach(async () => {
    // Clean up additional records
    await prisma.user.deleteMany({
      where: { email: { in: ["updated@example.com", "addtest@example.com"] } },
    });
  });

  it("TCUS01: should return user data when email exists and DB record matches expected output", async () => {
    const expectedOutput = {
      email: "test@example.com",
      role: "user",
    };

    const response = await request(app).get(
      `/api/users/email/${testUser.email}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(expectedOutput);
  });

  it("TCUS02: should return 404 and confirm DB has no record when email does not exist", async () => {
    const response = await request(app).get(
      `/api/users/email/nonexistent@example.com`
    );
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "User not found" });

    const userInDb = await prisma.user.findUnique({
      where: { email: "nonexistent@example.com" },
    });
    expect(userInDb).toBeNull();
  });

  it("TCUS03: should correctly add, update, and delete a record in the DB", async () => {
    // Add new user
    const addedUser = await prisma.user.create({
      data: {
        email: "addtest@example.com",
        password: "testpass",
        role: "user",
      },
    });

    let userInDb = await prisma.user.findUnique({
      where: { email: "addtest@example.com" },
    });
    console.log(
      `[INFO] User with email 'addtest@example.com' created successfully.`
    );

    expect(userInDb).not.toBeNull();
    expect(userInDb).toMatchObject({
      email: "addtest@example.com",
      role: "user",
    });
    console.log(
      `[INFO] User verification: Email 'addtest@example.com' with role 'user' - PASSED`
    );

    // Update user
    await prisma.user.update({
      where: { id: addedUser.id },
      data: { email: "updated@example.com" },
    });
    console.log(
      `[INFO] User email updated from 'addtest@example.com' to 'updated@example.com'.`
    );

    userInDb = await prisma.user.findUnique({
      where: { email: "updated@example.com" },
    });
    expect(userInDb).not.toBeNull();
    expect(userInDb.email).toBe("updated@example.com");
    console.log(
      `[INFO] User verification: Email updated to 'updated@example.com' - PASSED`
    );

    // Delete user
    await prisma.user.delete({ where: { id: addedUser.id } });
    console.log(
      `[INFO] User with email 'updated@example.com' deleted successfully.`
    );

    userInDb = await prisma.user.findUnique({
      where: { email: "updated@example.com" },
    });
    expect(userInDb).toBeNull();
    console.log(
      `[INFO] User verification: Unable to find user with email 'updated@example.com' - PASSED (User deleted).`
    );
  });
});
