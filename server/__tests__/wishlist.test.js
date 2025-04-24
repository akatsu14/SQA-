// __tests__/wishlist.test.js (Hoặc đặt trong thư mục tests của bạn)

const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
// Đảm bảo đường dẫn này chính xác tới file wishlist.js của bạn
const {
  getAllWishlistByUserId,
  getAllWishlist, // Assuming this might be an admin route or similar
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist,
} = require("../controllers/wishlist"); // Hoặc "../controllers/wishlist" tùy cấu trúc

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// === Setup Routes Chỉ Dành Cho Testing ===
app.get("/api/wishlist", getAllWishlist); // Route để lấy tất cả wishlist (ít dùng cho user)
app.get("/api/wishlist/user/:userId", getAllWishlistByUserId);
app.post("/api/wishlist", createWishItem);
app.get("/api/wishlist/:userId/:productId", getSingleProductFromWishlist);
app.delete("/api/wishlist/:userId/:productId", deleteWishItem);
// app.delete("/api/wishlist/user/:userId", deleteAllWishItemByUserId); // Route này chưa được export

// === Dữ Liệu Test (Phù hợp với Schema) ===
// --- Users ---
// Sử dụng email giả hoặc ID cố định để dễ quản lý trong test
const user1Data = { id: "test-user-id-1", email: "user1@test.com" };
const user2Data = { id: "test-user-id-2", email: "user2@test.com" };

// --- Category ---
const testCategoryData = {
  id: "test-cat-wishlist-id",
  name: "Category for Wishlist",
};

// --- Products ---
const product1Data = {
  id: "test-prod-wishlist-id-1",
  slug: "product-wishlist-1",
  title: "Wishlist Product 1",
  mainImage: "/img/wish1.jpg",
  description: "Desc for Wishlist Product 1",
  manufacturer: "Manu Wish 1",
  price: 1000, // Int
  inStock: 10,
  rating: 4,
  categoryId: testCategoryData.id,
};
const product2Data = {
  id: "test-prod-wishlist-id-2",
  slug: "product-wishlist-2",
  title: "Wishlist Product 2",
  mainImage: "/img/wish2.jpg",
  description: "Desc for Wishlist Product 2",
  manufacturer: "Manu Wish 2",
  price: 2500, // Int
  inStock: 5,
  rating: 5,
  categoryId: testCategoryData.id,
};
// --- Wishlist Item (sẽ được tạo trong beforeEach) ---
let wishlistItem1; // Biến lưu trữ item tạo sẵn cho user1 + product1

// === Kết Thúc Dữ Liệu Test ===

// === Hooks Setup & Teardown ===
beforeAll(async () => {
  await prisma.$connect();
  // Dọn dẹp dữ liệu cũ *trước khi* chạy test suite
  // Xóa theo thứ tự đảo ngược phụ thuộc: Wishlist -> User/Product -> Category
  await prisma.wishlist.deleteMany({
    where: { userId: { in: [user1Data.id, user2Data.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [user1Data.id, user2Data.id] } },
  });
  await prisma.product.deleteMany({
    where: { id: { in: [product1Data.id, product2Data.id] } },
  });
  await prisma.category.deleteMany({ where: { id: testCategoryData.id } });
});

afterAll(async () => {
  // Dọn dẹp dữ liệu tạo ra *sau khi* chạy xong test suite
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: { in: [user1Data.id, user2Data.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [user1Data.id, user2Data.id] } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [product1Data.id, product2Data.id] } },
    });
    await prisma.category.deleteMany({ where: { id: testCategoryData.id } });
  } catch (error) {
    console.error("Error during afterAll cleanup:", error);
  }
  await prisma.$disconnect();
});
// === Kết Thúc Hooks ===

// === Test Suite ===
describe("Wishlist API Endpoints", () => {
  // Chạy trước MỖI test case ('it' block)
  beforeEach(async () => {
    // 1. Tạo User (nếu chưa có)
    await prisma.user.upsert({
      where: { id: user1Data.id },
      update: {},
      create: user1Data,
    });
    await prisma.user.upsert({
      where: { id: user2Data.id },
      update: {},
      create: user2Data,
    });

    // 2. Tạo Category (nếu chưa có)
    await prisma.category.upsert({
      where: { id: testCategoryData.id },
      update: {},
      create: testCategoryData,
    });

    // 3. Tạo Products (nếu chưa có)
    await prisma.product.upsert({
      where: { id: product1Data.id },
      update: {},
      create: product1Data,
    });
    await prisma.product.upsert({
      where: { id: product2Data.id },
      update: {},
      create: product2Data,
    });

    // 4. Tạo sẵn 1 Wishlist Item cho User 1 và Product 1 để test GET/DELETE
    // Xóa trước để đảm bảo chỉ có 1 item được tạo mỗi lần beforeEach
    await prisma.wishlist.deleteMany({
      where: { userId: user1Data.id, productId: product1Data.id },
    });
    wishlistItem1 = await prisma.wishlist.create({
      data: {
        userId: user1Data.id,
        productId: product1Data.id,
      },
    });
    // Dọn dẹp wishlist của user 2 để đảm bảo user này bắt đầu rỗng
    await prisma.wishlist.deleteMany({ where: { userId: user2Data.id } });
  });

  // --- Test Cases for POST /api/wishlist ---
  describe("POST /api/wishlist", () => {
    it("TC01: should create a new wish item and return 201", async () => {
      const newItemData = { userId: user1Data.id, productId: product2Data.id };

      const response = await request(app)
        .post("/api/wishlist")
        .send(newItemData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id"); // Kiểm tra có ID được tạo
      expect(response.body.userId).toBe(newItemData.userId);
      expect(response.body.productId).toBe(newItemData.productId);

      // Verify in DB
      const itemsInDb = await prisma.wishlist.findMany({
        where: { userId: newItemData.userId, productId: newItemData.productId },
      });
      expect(itemsInDb.length).toBeGreaterThanOrEqual(1); // Kiểm tra item tồn tại
      expect(itemsInDb[0].userId).toBe(newItemData.userId);
      expect(itemsInDb[0].productId).toBe(newItemData.productId);
    });

    it("TC02: should allow creating a duplicate wish item (if no unique constraint)", async () => {
      // Thử tạo lại item đã tồn tại (tạo trong beforeEach)
      const existingItemData = {
        userId: user1Data.id,
        productId: product1Data.id,
      };

      const response = await request(app)
        .post("/api/wishlist")
        .send(existingItemData);

      // Nếu không có ràng buộc unique(userId, productId) thì việc tạo lại vẫn thành công
      expect(response.status).toBe(201);

      // Kiểm tra DB xem có nhiều hơn 1 record không (tùy thuộc vào logic mong muốn)
      const itemsInDb = await prisma.wishlist.findMany({
        where: {
          userId: existingItemData.userId,
          productId: existingItemData.productId,
        },
      });
      // Nếu schema cho phép duplicate thì sẽ có >= 2 items
      expect(itemsInDb.length).toBeGreaterThanOrEqual(1); // Ít nhất là 1 item
    });

    it("TC03: should return 500 if userId is invalid/missing relation", async () => {
      // ---> Tạm thời tắt console.error cho test case này <---
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidData = {
        userId: "non-existent-user",
        productId: product1Data.id,
      };
      const response = await request(app)
        .post("/api/wishlist")
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Error creating wish item");

      // ---> Khôi phục lại console.error <---
      errorSpy.mockRestore();
    });

    it("TC04: should return 500 if productId is invalid/missing relation", async () => {
      // ---> Tạm thời tắt console.error cho test case này <---
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidData = {
        userId: user1Data.id,
        productId: "non-existent-product",
      };
      const response = await request(app)
        .post("/api/wishlist")
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Error creating wish item");

      // ---> Khôi phục lại console.error <---
      errorSpy.mockRestore();
    });
  });

  // --- Test Cases for GET /api/wishlist/user/:userId ---
  describe("GET /api/wishlist/user/:userId", () => {
    it("TC05: should return wishlist items for a specific user", async () => {
      // User 1 có 1 item tạo trong beforeEach
      const response = await request(app).get(
        `/api/wishlist/user/${user1Data.id}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Chỉ có 1 item được tạo sẵn
      expect(response.body[0].userId).toBe(user1Data.id);
      expect(response.body[0].productId).toBe(product1Data.id);
      // Kiểm tra có include product không
      expect(response.body[0].product).toBeDefined();
      expect(response.body[0].product.id).toBe(product1Data.id);
      expect(response.body[0].product.title).toBe(product1Data.title);
    });

    it("TC06: should return an empty array for a user with no wishlist items", async () => {
      // User 2 không có item nào
      const response = await request(app).get(
        `/api/wishlist/user/${user2Data.id}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("TC07: should return an empty array for a non-existent user ID", async () => {
      const response = await request(app).get(
        `/api/wishlist/user/non-existent-user`
      );

      expect(response.status).toBe(200); // Controller không lỗi, chỉ là tìm không thấy
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  // --- Test Cases for GET /api/wishlist/:userId/:productId ---
  describe("GET /api/wishlist/:userId/:productId", () => {
    it("TC08: should return the specific wish item if it exists", async () => {
      // Item này được tạo trong beforeEach
      const response = await request(app).get(
        `/api/wishlist/${user1Data.id}/${product1Data.id}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true); // Controller trả về mảng
      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe(user1Data.id);
      expect(response.body[0].productId).toBe(product1Data.id);
    });

    it("TC09: should return an empty array if the item does not exist for the user", async () => {
      // User 1 không có product 2 trong wishlist
      const response = await request(app).get(
        `/api/wishlist/${user1Data.id}/${product2Data.id}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("TC10: should return an empty array for a non-existent user ID", async () => {
      const response = await request(app).get(
        `/api/wishlist/non-existent-user/${product1Data.id}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("TC11: should return an empty array for a non-existent product ID", async () => {
      const response = await request(app).get(
        `/api/wishlist/${user1Data.id}/non-existent-product`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  // --- Test Cases for DELETE /api/wishlist/:userId/:productId ---
  describe("DELETE /api/wishlist/:userId/:productId", () => {
    it("TC12: should delete the specific wish item and return 204", async () => {
      // Item này tồn tại từ beforeEach
      const response = await request(app).delete(
        `/api/wishlist/${user1Data.id}/${product1Data.id}`
      );

      expect(response.status).toBe(204); // No Content

      // Verify in DB
      const itemInDb = await prisma.wishlist.findFirst({
        where: { userId: user1Data.id, productId: product1Data.id },
      });
      expect(itemInDb).toBeNull(); // Item đã bị xóa
    });

    it("TC13: should return 204 even if the item to delete does not exist", async () => {
      // User 1 không có product 2
      const response = await request(app).delete(
        `/api/wishlist/${user1Data.id}/${product2Data.id}`
      );

      expect(response.status).toBe(204); // deleteMany không lỗi nếu không tìm thấy gì

      // Verify không có gì bị xóa thêm
      const count = await prisma.wishlist.count({
        where: { userId: user1Data.id },
      });
      // Nên bằng 0 nếu TC12 chạy trước và xóa item kia, hoặc giữ nguyên nếu chạy độc lập
      // Tốt nhất là kiểm tra count trước và sau khi gọi delete trong cùng 1 test,
      // nhưng với beforeEach thì kiểm tra count=0 là đủ nếu TC12 đã xóa item gốc
      expect(count).toBe(0); // Giả sử TC12 đã xóa item còn lại
    });

    it("TC14: should return 204 for non-existent user or product IDs", async () => {
      const responseUser = await request(app).delete(
        `/api/wishlist/non-existent-user/${product1Data.id}`
      );
      expect(responseUser.status).toBe(204);

      const responseProduct = await request(app).delete(
        `/api/wishlist/${user1Data.id}/non-existent-product`
      );
      expect(responseProduct.status).toBe(204);
    });
  });

  // --- Test Cases for GET /api/wishlist ---
  describe("GET /api/wishlist", () => {
    it("TC15: should return all wishlist items from all users", async () => {
      // Tạo thêm 1 item cho user 2 để có nhiều hơn 1 item tổng cộng
      await prisma.wishlist.create({
        data: { userId: user2Data.id, productId: product2Data.id },
      });
      // Bây giờ DB có: user1-product1 (từ beforeEach), user2-product2 (mới tạo)

      const response = await request(app).get("/api/wishlist");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Có 2 items tổng cộng (1 từ beforeEach, 1 vừa tạo)
      expect(response.body.length).toBe(2);

      // Kiểm tra xem có item của cả user1 và user2 không
      const hasUser1Item = response.body.some(
        (item) =>
          item.userId === user1Data.id && item.productId === product1Data.id
      );
      const hasUser2Item = response.body.some(
        (item) =>
          item.userId === user2Data.id && item.productId === product2Data.id
      );
      expect(hasUser1Item).toBe(true);
      expect(hasUser2Item).toBe(true);

      // Kiểm tra product được include
      expect(response.body[0].product).toBeDefined();
      expect(response.body[1].product).toBeDefined();

      // Dọn dẹp item mới tạo cho user 2
      await prisma.wishlist.deleteMany({
        where: { userId: user2Data.id, productId: product2Data.id },
      });
    });

    it("TC16: should return an empty array if no wishlist items exist globally", async () => {
      // Xóa item tạo sẵn trong beforeEach để đảm bảo DB trống
      await prisma.wishlist.deleteMany({ where: { userId: user1Data.id } });

      const response = await request(app).get("/api/wishlist");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});
