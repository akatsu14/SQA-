# Unit Test Process Report

## 1. Tools and Libraries Used

- **Jest**: Main testing framework for running and structuring unit tests.
- **Supertest**: For HTTP integration testing of Express routes (API endpoints).
- **@prisma/client**: Prisma ORM is used in the application, and its client is mocked in unit tests to avoid real database calls.
- **jest.mock**: Used to mock modules and isolate tests from external dependencies.

---

## 2. What is Tested and Why

### **Tested:**
- All controller functions in `server/controllers/` (e.g., `createProduct`, `getAllProducts`, `updateProduct`, etc.)
- All API endpoints defined in `server/routes/` (e.g., `/api/products`, `/api/categories`, etc.)
- Business logic: Each function that processes input, interacts with the database, or returns a response.

### **Why test these?**
- They contain the core business logic and are the main points of interaction for the application.
- They are most likely to change and are critical for application correctness.

### **Not re-tested:**
- Third-party libraries (e.g., Express, Prisma itself): These are assumed to be tested by their maintainers.
- Purely static files/configs: No logic to test.
- Middleware that only passes through or does trivial work: If a middleware only logs or passes the request, it may not need a dedicated unit test.

---

## 3. Test Case Set

Below is a detailed table for each test file.  
**For each test case, you will find:**  
- ID
- Target
- Input (object/array/param)
- Expected Output (status, object/array)
- Note

---

# (The following sections should be filled for each test file in server/__tests__ following the concise, data-focused style. Example:)

Here is a **full, data-focused test case report** for all major test files in `server/__tests__`, following your requested style.  
You can copy this into your `unit-test-report.md` file.

---

### server/__tests__/category.test.js

| ID     | Target                                                        | Input                        | Expected Output                        | Note                                        |
|--------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TSCA01 | should return category when id exists and DB record matches expected output | `{ id: testCategory.id }`    | 200 status, `{ name: "Test Category" }` | Verifies DB and API return correct category |
| TSCA02 | should return 404 and confirm DB has no record when id does not exist | `{ id: "nonexistent-id" }`   | 404 status, `{ error: "Category not found" }` | Ensures proper handling of non-existent IDs |
| TSCA03 | should get all categories                                     | `{}`                         | 200 status, `[ { name: "Test Category" }, ... ]` | Checks all categories are returned          |
| TSCA04 | should create a new category                                  | `{ name: "Another Test Category" }` | 201 status, `{ id: "...", name: "Another Test Category" }` | Verifies creation and DB state              |
| TSCA05 | should update a category                                      | `{ id: testCategory.id, name: "Updated Category" }` | 200 status, `{ name: "Updated Category" }` | Verifies update logic                       |
| TSCA06 | should return 404 when updating non-existent category         | `{ id: "nonexistent-id", name: "Updated Category" }` | 404 status, `{ error: "Category not found" }` | Handles update for missing category         |
| TSCA07 | should delete a category                                      | `{ id: categoryToDelete.id }` | 204 status, no content                  | Verifies deletion logic                     |
| TSCA08 | should correctly add, update, and delete a record in the DB   | `{ name: "Add Test Category" }`, `{ name: "Updated Test Category" }` | 201/200/204 status, DB reflects each step | Comprehensive CRUD test                     |
| TSCA09 | should return 409 if creating a category with duplicate name  | `{ name: "Unique Category" }` | 400/409 status, `{ error: ... }`        | Handles duplicate name                      |
| TSCA10 | should return 400 if creating a category with missing name    | `{}`                          | 400 status, `{ error: ... }`            | Handles missing required field              |
| TSCA11 | should return 409 if updating a category to a name that already exists | `{ id: catB.id, name: "CatA" }` | 400/409 status, `{ error: ... }`        | Handles duplicate name on update            |
| TSCA12 | should return 404 when deleting a non-existent category       | `{ id: "nonexistent-id" }`    | 404 status, `{ error: "Category not found" }` | Handles delete for missing category         |
| TSCA13 | should return 400 when getting a category with invalid ID format | `{ id: "invalid-id-format" }` | 400/404 status                          | Handles invalid ID format                   |
| TSCA14 | should return empty array when there are no categories        | `{}`                          | 200 status, `[]`                        | Handles empty DB                            |

---

### server/__tests__/mainImages.test.js

| ID      | Target                                                        | Input                                                                 | Expected Output                                                                                      | Note                                                        |
|---------|---------------------------------------------------------------|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| TSMI01  | should return 400 if no files are uploaded                    | `{}` (no files field)                                                 | 400 status, `{ message: "Nema otpremljenih fajlova" }`                                               | Ensures the function handles requests without files gracefully |
| TSMI02  | should return 400 if req.files is an empty object             | `{ files: {} }`                                                       | 400 status, `{ message: "Nema otpremljenih fajlova" }`                                               | Ensures the function handles empty files object              |
| TSMI03  | should call mv with the correct path and return 200 on success| `{ files: { uploadedFile: { name: "test-image.jpg", mv: mockMoveFile } } }` | 200 status, `{ message: "Fajl je uspešno otpremljen" }`                                              | Ensures file is saved and success message returned           |
| TSMI04  | should return 500 if mv function encounters an error          | `{ files: { uploadedFile: { name: "error-image.png", mv: mockMoveFile } } }` | 500 status, `Error("Disk full")`                                                                     | Ensures error is handled and returned                        |

---

### server/__tests__/getAllProducts.test.js

| ID     | Target                                                        | Input                        | Expected Output                        | Note                                        |
|--------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TCGA01 | should return all products in admin mode                      | `{ query: { mode: "admin" } }` | 200 status, `[ { id: "1", title: "Product 1" }, { id: "2", title: "Product 2" } ]` | Returns all products for admin              |
| TCGA02 | should handle database error in admin mode                    | `{ query: { mode: "admin" } }` | 500 status, `{ error: "Error fetching products" }` | Handles DB error gracefully                 |
| TCGA03 | should call findMany with pagination and sorting (non-admin mode) | `{ query: { page: "2" } }`   | 200 status, `[ { id: "1", title: "Product 1", category: { name: "Cat 1" } } ]` | Checks pagination and sorting logic         |

---

### server/__tests__/getAllProductOld.test.js

| ID     | Target                                                        | Input                        | Expected Output                        | Note                                        |
|--------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TCGAO01 | should fetch all products with categories                    | `{}`                         | 200 status, `[ { id: "test-product-id", ..., category: { name: "Test Category" } } ]` | Verifies products with category info        |
| TCGAO02 | should include category name in response                     | `{}`                         | 200 status, `[ { ..., category: { name: "Test Category" } } ]` | Checks category relation in response        |
| TCGAO03 | should return empty array when no products exist             | `{}`                         | 200 status, `[]`                        | Handles empty product list                  |
| TCGAO04 | should handle database errors                                | `{}`                         | (error logged, no response)              | Error handling, should be improved          |

---

### server/__tests__/getProductById.test.js

| ID     | Target                                                        | Input                        | Expected Output                        | Note                                        |
|--------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TCGP01 | should return 404 if product is not found                     | `{ params: { id: "1" } }`    | 404 status, `{ error: "Product not found" }` | Handles missing product                     |
| TCGP02 | should return product if found                                | `{ params: { id: "1" } }`    | 200 status, `{ id: "1", title: "Test Product", category: { name: "Test Category" } }` | Returns product if found                    |
| TCGP03 | should call findUnique with correct id and include category   | `{ params: { id: "1" } }`    | (DB call: `{ where: { id: "1" }, include: { category: true } }`) | Checks DB query params                      |
| TCGP04 | should return product by ID if exists                         | `{ params: { id: "1" } }`    | 200 status, `{ id: "1", title: "Test Product", category: { name: "Test Category" } }` | Returns product by ID                       |

---

### server/__tests__/updateProduct.test.js

| ID     | Target                                                        | Input                        | Expected Output                        | Note                                        |
|--------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TCUP01 | should update product if data is valid                        | `{ params: { id: "test-product-id" }, body: { ...UPDATE_DATA } }` | 200 status, `{ ...EXISTING_PRODUCT, ...UPDATE_DATA }` | Updates product with valid data             |
| TCUP02 | should return 404 if product not found                        | `{ params: { id: "test-product-id" }, body: { ...UPDATE_DATA } }` | 404 status, `{ error: "Product not found" }` | Handles missing product                     |
| TCUP03 | should handle partial updates                                 | `{ params: { id: "test-product-id" }, body: { title: "Partially Updated", price: 150 } }` | 200 status, `{ ...EXISTING_PRODUCT, title: "Partially Updated", price: 150 }` | Handles partial update                      |
| TCUP04 | should return 500 on database error                           | `{ params: { id: "test-product-id" }, body: { ...UPDATE_DATA } }` | 500 status, `{ error: "Error updating product" }` | Handles DB error                            |
| TCUP05 | should maintain category relation                             | `{ params: { id: "test-product-id" }, body: { ...UPDATE_DATA, categoryId: "new-category-id" } }` | 200 status, `{ ...EXISTING_PRODUCT, ...UPDATE_DATA, categoryId: "new-category-id" }` | Maintains category relation                 |

---

### server/__tests__/slugs.test.js

| ID     | Target                                                        | Input                        | Expected Output                        | Note                                        |
|--------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TSSL01 | should return product details (using title) when slug exists  | `{ slug: "actual-test-product-slug-v2" }` | 200 status, `{ id: "...", slug: "actual-test-product-slug-v2", title: "The Actual Test Product Title v2", ... }` | Ensures correct product and category are returned by slug   |
| TSSL02 | should return 404 Not Found when slug does not exist          | `{ slug: "this-slug-definitely-does-not-exist" }` | 404 status, `{ error: "Product not found" }` | Ensures 404 and error message for missing slug              |

---

### server/__tests__/productImages.test.js

| ID      | Target                                                        | Input                        | Expected Output                        | Note                                        |
|---------|---------------------------------------------------------------|------------------------------|-----------------------------------------|---------------------------------------------|
| TSPI01  | should create a new image                                     | `{ productID: testProduct.id, image: "new-image.gif" }` | 201 status, `{ imageID: "...", productID: testProduct.id, image: "new-image.gif" }` | Verifies image creation and DB state        |
| TSPI02  | should return all images for a given productID                | `{ id: testProduct.id }`     | 200 status, `[ { imageID: "...", productID: testProduct.id, image: "test-image.jpg" }, ... ]` | Verifies all images for product are returned|
| TSPI03  | should return 200 and empty array if productID has no images  | `{ id: "non-existent-product-clx" }` | 200 status, `[]`                        | Ensures empty array for product with no images|
| TSPI04  | should update the first image found for the productID         | `{ id: testProduct.id, image: "updated-image.png" }` | 200 status, `{ imageID: "...", productID: testProduct.id, image: "updated-image.png" }` | Verifies image update                       |
| TSPI05  | should delete all images for the given productID              | `{ id: testProduct.id }`     | 204 status, no content                  | Verifies all images for product are deleted  |

---

server/tests/customer_order_product.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-----------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| TCCOP01 | createOrderProduct | { customerOrderId, productId, quantity: 5 } (valid IDs from setup) | 201 status, body: { customerOrderId, productId, quantity: 5, id: <generated> } | Main business scenario |
| TCCOP02 | updateProductOrder | PUT /api/order-product/:id with { customerOrderId, productId, quantity: 10 } (existing link ID) | 200 status, body: updated link { id, customerOrderId, productId, quantity: 10 } | Main business scenario |
| TCCOP03 | updateProductOrder | PUT /api/order-product/clxxxxxxxxxxxxxxxxxx (non-existent ID), { quantity: 1 } | 404 status, body: { error: "Order not found" } | Edge case: not found |
| TCCOP04 | deleteProductOrder | DELETE /api/order-product/:customerOrderId (with 2 links for same order) | 204 status, all links for that customerOrderId deleted | Main scenario, multi-delete |
| TCCOP05 | getProductOrder | GET /api/order-product/:customerOrderId (valid, with 1 link) | 200 status, body: [ { customerOrderId, productId, quantity, product: { id, title, ... } } ] | Main scenario, details |
| TCCOP06 | getProductOrder | GET /api/order-product/clxxxxxxxxxxxxxxxxxx (non-existent orderId) | 200 status, body: [] | Edge case: not found |
| TCCOP07 | getAllProductOrders | GET /api/order-product (after creating 2 orders, 2 products, 3 links) | 200 status, body: [ { customerOrderId, customerOrder, products: [ { id, title, quantity, ... }, ... ] }, ... ] (grouped by order) | Grouped, multi-order test |

---

server/tests/customer_orders.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-----------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| TSCO01 | getCustomerOrder | GET /api/orders/:id (existing order ID) | 200 status, body: order object matching input, includes id, dateTime | Main scenario |
| TSCO02 | getCustomerOrder | GET /api/orders/clxxxxxxxxxxxxxxxxxx (non-existent ID) | 404 status, body: { error: "Order not found" } | Edge case: not found |
| TSCO03 | getAllOrders | GET /api/orders | 200 status, body: array of orders, includes test order | Main scenario |
| TSCO04 | createCustomerOrder | POST /api/orders with { ...orderData, email: "another.order@example.com", ... } | 201 status, body: new order object with all fields, id, dateTime | Main scenario |
| TSCO05 | updateCustomerOrder | PUT /api/orders/:id with updated fields (e.g., status, total, email) | 200 status, body: updated order object with new values | Main scenario |
| TSCO06 | updateCustomerOrder | PUT /api/orders/clxxxxxxxxxxxxxxxxxx (non-existent ID), { status: "Cancelled" } | 404 status, body: { error: "Order not found" } | Edge case: not found |
| TSCO07 | deleteCustomerOrder | DELETE /api/orders/:id (existing order created in test) | 204 status, order deleted from DB | Main scenario |
| TSCO08 | create/update/delete | Direct DB ops: create, update, delete order with { name: "Add", lastname: "TestOrder", ... } | Order created, updated (status: "Processing", total: 55), then deleted; DB reflects each step | CRUD scenario, DB direct |

---
server/tests/deleteProduct.test.js
| ID | Target | Input | Expected Output | Note |
|---------|---------------|------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------------|
| TCDP01 | deleteProduct | params: { id: '1' } (product with related order items) | 400 status, { error: 'Cannot delete product because of foreign key constraint. ' } | Foreign key constraint |
| TCDP02 | deleteProduct | params: { id: '1' } (no related order items) | 204 status, response sent, product deleted | Main scenario |
| TCDP03 | deleteProduct | params: { id: '1' }, DB error on findMany | 500 status, { error: "Error deleting product" }, error logged | Error handling |
| TCDP04* | deleteProduct | params: { id: '1' } (no related order items) | 204 status, response sent, product deleted | Main scenario (duplicate of 2) |
----

server/tests/getAllProductOld.test.js
| ID | Target | Input | Expected Output | Note |
|----------|--------------------|----------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| TCGAO01 | getAllProductsOld | {} (empty request) | 200 status, body: [ { id, slug, title, ..., category: { name: 'Test Category' } } ] | Main scenario, includes category |
| TCGAO02 | getAllProductsOld | {} (empty request) | Response includes category.name in each product | Category relation check |
| TCGAO03 | getAllProductsOld | {} (empty request, no products in DB) | 200 status, body: [] | Edge case: empty DB |
| TCGAO04 | getAllProductsOld | {} (DB error simulated) | Error is logged (should be improved to return error response) | Error handling, logs only |
--- 
server/tests/getAllProducts.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-----------------|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCGA01 | getAllProducts | query: { mode: 'admin' } | 200 status (implicit), body: [ { id: '1', title: 'Product 1' }, { id: '2', title: 'Product 2' } ] | Main scenario, admin mode |
| TCGA02 | getAllProducts | query: { mode: 'admin' }, DB error simulated | 500 status, { error: 'Error fetching products' } | Error handling |
| TCGA03 | getAllProducts | query: { page: '2' }, url: '/api/products?page=2&sort=titleAsc' | 200 status (implicit), body: [ { id: '1', title: 'Product 1', category: { name: 'Cat 1' } } ] | Pagination, sorting, non-admin |

---

server/tests/getProductById.test.js
| ID | Target | Input | Expected Output | Note |
|---------|------------------|------------------------------|---------------------------------------------------------------------------------|-----------------------------|
| TCGP01 | getProductById | params: { id: '1' } (not found) | 404 status, { error: 'Product not found' } | Edge case: not found |
| TCGP02 | getProductById | params: { id: '1' } (found) | 200 status, { id: '1', title: 'Test Product', category: { name: 'Test Category' } } | Main scenario |
| TCGP03 | getProductById | params: { id: '1' } | Calls findUnique with { where: { id: '1' }, include: { category: true } } | Internal logic, category |
| TCGP04 | getProductById | params: { id: '1' } (found) | 200 status, { id: '1', title: 'Test Product', category: { name: 'Test Category' } } | Main scenario (duplicate) |

---

server/tests/mainImages.test.js
| ID | Target | Input | Expected Output | Note |
|---------|------------------|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCMI01 | uploadMainImage | No files in request | 400 status, { message: "Nema otpremljenih fajlova" } | Validation: no files |
| TCMI02 | uploadMainImage | files: {} (empty object) | 400 status, { message: "Nema otpremljenih fajlova" } | Validation: empty files |
| TCMI03 | uploadMainImage | files: { uploadedFile: { name: "test-image.jpg", mv: fn } } | 200 status, { message: "Fajl je uspešno otpremljen" }, mv called with ../public/test-image.jpg | Main scenario, file upload |
| TCMI04 | uploadMainImage | files: { uploadedFile: { name: "error-image.png", mv: fn } }, mv throws error | 500 status, error object sent as response | Error handling, mv failure |

---

server/tests/productImages.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-------------------------|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCPI01 | createImage | { productID, image: "new-image.gif" } (valid productID) | 201 status, body: { productID, image: "new-image.gif", imageID } | Main scenario, create image |
| TCPI02 | getSingleProductImages | GET /api/images/:id (productID with 2 images) | 200 status, body: array of 2 images for productID | Main scenario, multi-image |
| TCPI03 | getSingleProductImages | GET /api/images/:id (non-existent productID) | 200 status, body: [] | Edge case: no images |
| TCPI04 | updateImage | PUT /api/images/:id with { productID, image: updatedImageName } | 200 status, body: updated image object, imageID unchanged | Main scenario, update image |
| TCPI05 | deleteImage | DELETE /api/images/:id (productID with 2 images) | 204 status, all images for productID deleted | Main scenario, delete all |

---


server/tests/search.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-----------------|---------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCSH01 | searchProducts | query: {} (no query param) | 400 status, { error: "Query parameter is required" } | Validation: missing query |
| TCSH02 | searchProducts | query: { query: 'Test' } | 200 status (implicit), body: [ { id: '1', title: 'Test Product', ... } ] | Main scenario, search match |
| TCSH03 | searchProducts | query: { query: 'NonExistent' } | 200 status (implicit), body: [] | Edge case: no matches |
| TCSH04 | searchProducts | query: { query: 'Test' }, DB error | 500 status, { error: "Error searching products" }, error logged | Error handling |

---
server/tests/searchProduct.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-----------------|---------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCSP01 | searchProducts | query: {} (no query param) | 400 status, { error: "Query parameter is required" } | Validation: missing query |
| TCSP02 | searchProducts | query: { query: 'Test' } | 200 status (implicit), body: [ { id: '1', title: 'Test Product', ... } ] | Main scenario, search match |
| TCSP03 | searchProducts | query: { query: 'NonExistent' } | 200 status (implicit), body: [] | Edge case: no matches |
| TCSP04 | searchProducts | query: { query: 'Test' }, DB error | 500 status, { error: "Error searching products" }, error logged | Error handling |
| TCSP05 | searchProducts | query: { query: 'Test' } | 200 status (implicit), body: [ { id: '1', title: 'Test Product', ... } ] | Main scenario, search match |

---
server/tests/slugs.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-------------------|---------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCSL01 | getProductBySlug | GET /api/slugs/actual-test-product-slug-v2 (existing slug) | 200 status, body: product object with all fields, including category: { id, name } | Main scenario, full details |
| TCSL02 | getProductBySlug | GET /api/slugs/this-slug-definitely-does-not-exist (non-existent slug) | 404 status, { error: "Product not found" } | Edge case: not found |
---
server/tests/user.test.js
| ID | Target | Input | Expected Output | Note |
|---------|------------------|------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCUS01 | getUserByEmail | GET /api/users/email/test@example.com (existing email) | 200 status, { email: "test@example.com", role: "user" } | Main scenario |
| TCUS02 | getUserByEmail | GET /api/users/email/nonexistent@example.com | 404 status, { error: "User not found" } | Edge case: not found |
| TCUS03 | create/update/deleteUser | Direct DB ops: create { email: "addtest@example.com", ... }, update to "updated@example.com", then delete | User created, updated, deleted; DB reflects each step | CRUD scenario, DB direct |
---
server/tests/wishlist.test.js
| ID | Target | Input | Expected Output | Note |
|---------|-------------------------------|------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------|
| TCWL01 | createWishItem | { userId: "test-user-id-1", productId: "test-prod-wishlist-id-2" } | 201 status, wish item created, correct userId/productId | Main scenario |
| TCWL02 | createWishItem | { userId: "test-user-id-1", productId: "test-prod-wishlist-id-1" } (duplicate) | 201 status, wish item created (duplicates allowed) | Schema allows duplicates |
| TCWL03 | createWishItem | { userId: "non-existent-user", productId: "test-prod-wishlist-id-1" } | 500 status, { error: "Error creating wish item" } | Validation/edge case |
| TCWL04 | createWishItem | { userId: "test-user-id-1", productId: "non-existent-product" } | 500 status, { error: "Error creating wish item" } | Validation/edge case |
| TCWL05 | getAllWishlistByUserId | GET /api/wishlist/user/test-user-id-1 | 200 status, array with 1 item, includes product details | Main scenario |
| TCWL06 | getAllWishlistByUserId | GET /api/wishlist/user/test-user-id-2 | 200 status, [] | Edge case: no items |
| TCWL07 | getAllWishlistByUserId | GET /api/wishlist/user/non-existent-user | 200 status, [] | Edge case: user not found |
| TCWL08 | getSingleProductFromWishlist | GET /api/wishlist/test-user-id-1/test-prod-wishlist-id-1 | 200 status, array with 1 item | Main scenario |
| TCWL09 | getSingleProductFromWishlist | GET /api/wishlist/test-user-id-1/test-prod-wishlist-id-2 | 200 status, [] | Edge case: not found |
| TCWL10 | getSingleProductFromWishlist | GET /api/wishlist/non-existent-user/test-prod-wishlist-id-1 | 200 status, [] | Edge case: user not found |
| TCWL11 | getSingleProductFromWishlist | GET /api/wishlist/test-user-id-1/non-existent-product | 200 status, [] | Edge case: product not found|
| TCWL12 | deleteWishItem | DELETE /api/wishlist/test-user-id-1/test-prod-wishlist-id-1 | 204 status, wish item deleted | Main scenario |
| TCWL13 | deleteWishItem | DELETE /api/wishlist/test-user-id-1/test-prod-wishlist-id-2 (not exist) | 204 status | Edge case: not found |
| TCWL14 | deleteWishItem | DELETE /api/wishlist/non-existent-user/test-prod-wishlist-id-1 or /api/wishlist/test-user-id-1/non-existent-product | 204 status | Edge case: not found |
| TCWL15 | getAllWishlist | GET /api/wishlist (with 2 items in DB) | 200 status, array of all wishlist items, includes product details | Main scenario, all users |
| TCWL16 | getAllWishlist | GET /api/wishlist (DB empty) | 200 status, [] | Edge case: empty DB |