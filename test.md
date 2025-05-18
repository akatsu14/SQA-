Great! Here is the **full Unit Test Process Report** for all test files in `server/__tests__` in **Markdown** format.  
After this, I will provide instructions and content for converting it to `.docx`.

---

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

### server/__tests__/createProduct.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCCP01 | createProduct | Valid product data (all required fields) | 201 status, product created, returned product matches input | Main business scenario |
| TCCP02 | createProduct | Missing required field (e.g., no title) | 500 status, error message | Validation/edge case |
| TCCP03 | createProduct | Product data without rating | Product created with rating=5 | Checks default value logic |

---

### server/__tests__/getAllProducts.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCGA01 | getAllProducts | Query with `mode: 'admin'` | 200 status, all products returned | Main business scenario |
| TCGA02 | getAllProducts | Simulated DB error | 500 status, error message | Error handling |
| TCGA03 | getAllProducts | Query with pagination/sorting | 200 status, paginated/sorted products | Checks query logic |

---

### server/__tests__/getAllProductOld.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCGAO01 | getAllProductsOld | No input | 200 status, products with category info | Main business scenario |
| TCGAO02 | getAllProductsOld | No input | Response includes category name | Category relation check |
| TCGAO03 | getAllProductsOld | No products in DB | 200 status, empty array | Edge case |
| TCGAO04 | getAllProductsOld | Simulated DB error | Error logged, (should be improved to return error) | Error handling |

---

### server/__tests__/getProductById.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCGP01 | getProductById | Non-existent product ID | 404 status, error message | Edge case |
| TCGP02 | getProductById | Existing product ID | 200 status, product returned | Main scenario |
| TCGP03 | getProductById | Existing product ID | findUnique called with correct params | Internal logic |
| TCGP04 | getProductById | Existing product ID | 200 status, product returned | Main scenario |

---

### server/__tests__/deleteProduct.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCDP01 | deleteProduct | Product with related order items | 400 status, error message | Foreign key constraint |
| TCDP02 | deleteProduct | Product with no related order items | 204 status, product deleted | Main scenario |
| TCDP03 | deleteProduct | Simulated DB error | 500 status, error message | Error handling |
| TCDP04 | deleteProduct | Product with no related order items | 204 status, product deleted | Main scenario |

---

### server/__tests__/updateProduct.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCUP01 | updateProduct | Valid update data | 200 status, product updated | Main scenario |
| TCUP02 | updateProduct | Non-existent product ID | 404 status, error message | Edge case |
| TCUP03 | updateProduct | Partial update data | 200 status, product updated | Partial update |
| TCUP04 | updateProduct | Simulated DB error | 500 status, error message | Error handling |
| TCUP05 | updateProduct | Update with new categoryId | 200 status, product updated | Category relation |

---

### server/__tests__/search.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCSH01 | searchProducts | No query param | 400 status, error message | Validation |
| TCSH02 | searchProducts | Query param | 200 status, products returned | Main scenario |
| TCSH03 | searchProducts | Query param, no matches | 200 status, empty array | Edge case |
| TCSH04 | searchProducts | Simulated DB error | 500 status, error message | Error handling |

---

### server/__tests__/searchProduct.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TCSP01 | searchProducts | No query param | 400 status, error message | Validation |
| TCSP02 | searchProducts | Query param | 200 status, products returned | Main scenario |
| TCSP03 | searchProducts | Query param, no matches | 200 status, empty array | Edge case |
| TCSP04 | searchProducts | Simulated DB error | 500 status, error message | Error handling |
| TCSP05 | searchProducts | Query param | 200 status, products returned | Main scenario |

---

### server/__tests__/customer_order_product.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSCOP01 | createOrderProduct | Valid data | 201 status, link created | Main scenario |
| TSCOP02 | updateProductOrder | Valid update data | 200 status, link updated | Main scenario |
| TSCOP03 | updateProductOrder | Non-existent ID | 404 status, error message | Edge case |
| TSCOP04 | deleteProductOrder | Valid customerOrderId | 204 status, links deleted | Main scenario |
| TSCOP05 | getProductOrder | Valid customerOrderId | 200 status, links returned | Main scenario |
| TSCOP06 | getProductOrder | Non-existent customerOrderId | 200 status, empty array | Edge case |
| TSCOP07 | getAllProductOrders | No input | 200 status, grouped orders | Main scenario |

---

### server/__tests__/user.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSUS01 | getUserByEmail | Existing email | 200 status, user data | Main scenario |
| TSUS02 | getUserByEmail | Non-existent email | 404 status, error message | Edge case |
| TSUS03 | createUser/updateUser/deleteUser | New user data, update data | User created, updated, deleted | CRUD scenario |

---

### server/__tests__/productImages.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSPI01 | createImage | Valid image data | 201 status, image created | Main scenario |
| TSPI02 | getSingleProductImages | Valid productID | 200 status, images returned | Main scenario |
| TSPI03 | getSingleProductImages | Non-existent productID | 200 status, empty array | Edge case |
| TSPI04 | updateImage | Valid update data | 200 status, image updated | Main scenario |
| TSPI05 | deleteImage | Valid productID | 204 status, images deleted | Main scenario |

---

### server/__tests__/slugs.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSSL01 | getProductBySlug | Existing slug | 200 status, product details | Main scenario |
| TSSL02 | getProductBySlug | Non-existent slug | 404 status, error message | Edge case |

---

### server/__tests__/category.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSCA01 | getCategory | Existing category ID | 200 status, category data | Main scenario |
| TSCA02 | getCategory | Non-existent category ID | 404 status, error message | Edge case |
| TSCA03 | getAllCategories | No input | 200 status, categories array | Main scenario |
| TSCA04 | createCategory | New category data | 201 status, category created | Main scenario |
| TSCA05 | updateCategory | Existing category ID, update data | 200 status, category updated | Main scenario |
| TSCA06 | updateCategory | Non-existent category ID, update data | 404 status, error message | Edge case |
| TSCA07 | deleteCategory | Category to delete | 204 status, category deleted | Main scenario |
| TSCA08 | createCategory/updateCategory/deleteCategory | New category data, update data | Category created, updated, deleted | CRUD scenario |
| TSCA09 | createCategory | Duplicate category name | 400/409 status, error message | Validation |
| TSCA10 | createCategory | Missing name | 400 status, error message | Validation |
| TSCA11 | updateCategory | Update to duplicate name | 400/409 status, error message | Validation |
| TSCA12 | deleteCategory | Non-existent category ID | 404 status, error message | Edge case |
| TSCA13 | getCategory | Invalid ID format | 400/404 status | Validation/edge case |
| TSCA14 | getAllCategories | No categories in DB | 200 status, empty array | Edge case |

---

### server/__tests__/customer_orders.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSCO01 | getCustomerOrder | Existing order ID | 200 status, order data | Main scenario |
| TSCO02 | getCustomerOrder | Non-existent order ID | 404 status, error message | Edge case |
| TSCO03 | getAllOrders | No input | 200 status, orders array | Main scenario |
| TSCO04 | createCustomerOrder | New order data | 201 status, order created | Main scenario |
| TSCO05 | updateCustomerOrder | Existing order ID, update data | 200 status, order updated | Main scenario |
| TSCO06 | updateCustomerOrder | Non-existent order ID, update data | 404 status, error message | Edge case |
| TSCO07 | deleteCustomerOrder | Order to delete | 204 status, order deleted | Main scenario |
| TSCO08 | createCustomerOrder/updateCustomerOrder/deleteCustomerOrder | New order data, update data | Order created, updated, deleted | CRUD scenario |

---

### server/__tests__/mainImages.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSMI01 | uploadMainImage | No files in request | 400 status, error message | Validation |
| TSMI02 | uploadMainImage | Empty files object | 400 status, error message | Validation |
| TSMI03 | uploadMainImage | Valid file upload | 200 status, success message | Main scenario |
| TSMI04 | uploadMainImage | Simulated file move error | 500 status, error object | Error handling |

---

### server/__tests__/wishlist.test.js

| ID | Target | Input | Expected Output | Note |
|----|--------|-------|---------------|------|
| TSWL01 | createWishItem | Valid wish item data | 201 status, wish item created | Main scenario |
| TSWL02 | createWishItem | Duplicate wish item data | 201 status, wish item created | Schema allows duplicates |
| TSWL03 | createWishItem | Invalid userId | 500 status, error message | Validation/edge case |
| TSWL04 | createWishItem | Invalid productId | 500 status, error message | Validation/edge case |
| TSWL05 | getAllWishlistByUserId | Valid userId | 200 status, wishlist items | Main scenario |
| TSWL06 | getAllWishlistByUserId | User with no wishlist items | 200 status, empty array | Edge case |
| TSWL07 | getAllWishlistByUserId | Non-existent userId | 200 status, empty array | Edge case |
| TSWL08 | getSingleProductFromWishlist | Valid userId and productId | 200 status, wish item | Main scenario |
| TSWL09 | getSingleProductFromWishlist | Valid userId, non-existent productId | 200 status, empty array | Edge case |
| TSWL10 | getSingleProductFromWishlist | Non-existent userId | 200 status, empty array | Edge case |
| TSWL11 | getSingleProductFromWishlist | Non-existent productId | 200 status, empty array | Edge case |
| TSWL12 | deleteWishItem | Valid userId and productId | 204 status, wish item deleted | Main scenario |
| TSWL13 | deleteWishItem | Non-existent wish item | 204 status | Edge case |
| TSWL14 | deleteWishItem | Non-existent userId or productId | 204 status | Edge case |
| TSWL15 | getAllWishlist | No input | 200 status, all wishlist items | Main scenario |
| TSWL16 | getAllWishlist | No wishlist items in DB | 200 status, empty array | Edge case |

---

## 4. Notes

- All test cases are written using Jest and, where needed, Supertest for HTTP assertions.
- Test case IDs are unique and consistent for easy tracking.
- Edge cases, validation, and error handling are included for robustness.
- Mocking is used to isolate tests from real database and external dependencies.

---

# How to Convert to .docx

1. **Copy the above Markdown content.**
2. Use an online Markdown-to-Word converter (such as [markdowntodocx.com](https://markdowntodocx.com/) or [pandoc](https://pandoc.org/)).
3. Paste the Markdown and export as `.docx`.

If you want, I can generate the raw content for a `.docx` file as well (using Markdown-to-Word conversion tools).

---

**Let me know if you want the .docx file content or download instructions!**
