
# 1. Additional Test Cases for Single Product Page (SPP)

| ID | Feature | Test Case | Test Data | Expected Result | Tester | Date | Result | Note |
|---|---|---|---|---|---|---|---|---|
| SPP26 | Validate | Check maximum order quantity limit | Quantity: 999 | System handles correctly or displays limit message | Manh | | | |
| SPP27 | Validate | Check negative quantity value | Quantity: -1 | Error message displayed, negative values not allowed | Manh | | | |
| SPP28 | Validate | Check XSS protection in review form | `<script>alert(1)</script>` | Content is sanitized, script not executed | Manh | | | |
| SPP29 | Function | Check behavior when internet connection is lost | Disconnect network | Appropriate error message displayed | Manh | | | |
| SPP30 | UI | Check display with screen reader | NVDA/VoiceOver | Content is read correctly | Manh | | | |
| SPP31 | UI | Check alt attributes for product images | All images | All images have descriptive alt attributes | Manh | | | |
| SPP32 | UI | Check color contrast | WCAG 2.1 AA | Contrast meets standards | Manh | | | |
| SPP33 | Business Operation | Check price display by region | Change locale | Price displayed with correct currency | Manh | | | |
| SPP34 | Function | Check product image zoom | Click on image | Image zooms in | Manh | | | |
| SPP35 | Business Operation | Check out-of-stock product | Product: Out-of-stock | "Add to cart" button is disabled | Manh | | | |

# 2. Additional Test Cases for Shop Page (SP)

| ID | Feature | Test Case | Test Data | Expected Result | Tester | Date | Result | Note |
|---|---|---|---|---|---|---|---|---|
| SP23 | Function | Check behavior when internet connection is lost | Disconnect network | Appropriate error message displayed | ManhLD | | | |
| SP24 | Validate | Check display when no products match | Filter with no results | "No products found" message displayed | ManhLD | | | |
| SP27 | UI | Check display with screen reader | NVDA/VoiceOver | Content is read correctly | ManhLD | | | |
| SP28 | UI | Check alt attributes for product images | All images | All images have alt attributes | ManhLD | | | |
| SP29 | UI | Check display when CSS is disabled | Disable CSS | Content remains readable | ManhLD | | | |
| SP30 | Business Operation | Check page load with many products | >100 products | Page loads within reasonable time | ManhLD | | | |
| SP31 | Business Operation | Check price display by region | Change locale | Price displayed with correct currency | ManhLD | | | |
| SP32 | Function | Check saving filters to URL | Apply multiple filters | URL contains all filter parameters | ManhLD | | | |

# 3. Additional Test Cases for Home Page (HP)

| ID | Feature | Test Case | Test Data | Expected Result | Tester | Date | Result | Note |
|---|---|---|---|---|---|---|---|---|
| HP32 | Function | Check login functionality from header | Valid user | Login successful | Manh | | | |
| HP33 | Validate | Check search with special characters | Keyword: "%$#@!" | Handled correctly, no crash | Manh | | | |
| HP34 | Validate | Check XSS protection in search form | `<script>alert(1)</script>` | Input is sanitized | Manh | | | |
| HP35 | Function | Check behavior when internet connection is lost | Disconnect network | Appropriate error message displayed | Manh | | | |
| HP36 | UI | Check display with screen reader | NVDA/VoiceOver | Content is read correctly | Manh | | | |
| HP37 | UI | Check alt attributes for banner images | Banner images | All banners have alt attributes | Manh | | | |
| HP38 | UI | Check color contrast | WCAG 2.1 AA | Contrast meets standards | Manh | | | |
| HP39 | Business Operation | Check price display by region | Change locale | Price displayed with correct currency | Manh | | | |
| HP40 | Business Operation | Check page load with slow connection | 3G network | Skeleton/loader displayed appropriately | Manh | | | |
| HP41 | Business Operation | Check language change | Select different language | Content displayed in correct language | Manh | | | |

These additional test cases have been designed to match the ID format and Feature classification of each file, while covering missing aspects such as security, accessibility, error handling, and internationalization.
