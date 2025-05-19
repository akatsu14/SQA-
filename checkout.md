
# Bảng Tổng Hợp Test Cases cho Checkout Process

| ID | Feature | Type | Test case | Pre Condition | Test case Description | Test data | Expected Result | Tester | Date | Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| COP001 | Checkout | UI | Verify page layout | User is on checkout page | Check if page layout matches design specification | N/A | Layout matches design with correct sections | | | | |
| COP002 | Checkout | UI | Verify color scheme | User is on checkout page | Check if colors match brand guidelines | N/A | All colors match the design system | | | | |
| COP003 | Checkout | UI | Verify typography | User is on checkout page | Check font families, sizes and weights | N/A | Typography matches design specifications | | | | |
| COP004 | Checkout | UI | Verify form spacing | User is on checkout page | Check spacing between form elements | N/A | Consistent spacing according to design | | | | |
| COP005 | Checkout | UI | Verify button styling | User is on checkout page | Check Pay Now button appearance | N/A | Button has correct color, size and text | | | | |
| COP006 | Checkout | UI | Verify required field indicators | User is on checkout page | Check if required fields have asterisk (*) | N/A | All required fields marked with asterisk | | | | |
| COP007 | Checkout | UI | Verify error message styling | User submits invalid data | Check error message appearance | Invalid form data | Error messages have consistent styling | | | | |
| COP008 | Checkout | UI | Verify success message styling | User completes checkout | Check success message appearance | Valid form submission | Success message has correct styling | | | | |
| COP009 | Checkout | UI | Verify input field focus states | User interacts with form | Check appearance of focused fields | Click on input field | Focus state visible with correct styling | | | | |
| COP010 | Checkout | UI | Verify hover states | User hovers over elements | Check hover effects on interactive elements | Hover over buttons | Hover effects match design specifications | | | | |
| COP011 | Checkout | UI | Verify section headings | User is on checkout page | Check headings for each section | N/A | Headings have correct styling and spacing | | | | |
| COP012 | Checkout | UI | Verify mobile responsiveness | User accesses on mobile | Check layout on small screens | Mobile viewport | Responsive design adapts for mobile | | | | |
| COP013 | Checkout | UI | Verify tablet responsiveness | User accesses on tablet | Check layout on medium screens | Tablet viewport | Responsive design adapts for tablet | | | | |
| COP014 | Checkout | UI | Verify desktop responsiveness | User accesses on desktop | Check layout on large screens | Desktop viewport | Layout optimized for desktop view | | | | |
| COP015 | Checkout | UI | Verify order summary styling | User has products in cart | Check styling of order summary section | Products in cart | Order summary styled according to design | | | | |
| COP016 | Checkout | UI | Verify product image sizing | User has products in cart | Check product images in order summary | Products with images | Images displayed with correct dimensions | | | | |
| COP017 | Checkout | UI | Verify form alignment | User is on checkout page | Check alignment of form elements | N/A | Labels and inputs aligned consistently | | | | |
| COP018 | Checkout | UI | Verify text contrast | User is on checkout page | Check text contrast for accessibility | N/A | Text has sufficient contrast ratio | | | | |
| COP019 | Checkout | UI | Verify icon usage | User is on checkout page | Check if icons are used consistently | N/A | Icons match design system | | | | |
| COP020 | Checkout | UI | Verify form field states | User interacts with form | Check different field states (normal, focus, error) | Interact with fields | All states display correctly per design | | | | |
| COP021 | Checkout | Function | Verify navigation to checkout page | User has products in cart | Navigate from cart to checkout page | Products in cart | Checkout page loads with all sections visible | | | | |
| COP022 | Checkout | Function | Verify empty cart handling | User has no products in cart | Attempt to access checkout page | Empty cart | User redirected to cart page with error message | | | | |
| COP023 | Checkout | Function | Verify order summary display | User has products in cart | Check if all products in cart are displayed in order summary | Multiple products in cart | All products displayed with correct information | | | | |
| COP024 | Checkout | Function | Verify product image in order summary | User has products in cart | Check if product images are displayed correctly | Products with images | Images display correctly in order summary | | | | |
| COP025 | Checkout | Function | Verify product without image in order summary | User has products with missing images | Check fallback image behavior | Product without image | Placeholder image displayed correctly | | | | |
| COP026 | Checkout | Function | Verify product quantity in order summary | User has products with different quantities | Check if quantities display correctly | Products with varying quantities | Quantities display correctly for each product | | | | |
| COP027 | Checkout | Function | Verify form field existence | User is on checkout page | Check if all required input fields exist | N/A | All required fields present and labeled correctly | | | | |
| COP028 | Checkout | Function | Verify successful order creation | User submits valid form | Complete checkout with valid data | Complete valid form data | Order created, success message displayed | | | | |
| COP029 | Checkout | Function | Verify redirection after successful checkout | User completes checkout | Check redirection after order is created | Valid checkout submission | User redirected to homepage | | | | |
| COP030 | Checkout | Function | Verify cart clearing after checkout | User completes checkout | Check if cart is empty after successful checkout | Completed checkout | Cart emptied with quantity reset to 0 | | | | |
| COP031 | Checkout | Function | Verify form reset after checkout | User completes checkout | Check if form fields are reset after checkout | Completed checkout | All form fields cleared to initial state | | | | |
| COP032 | Checkout | Function | Verify multiple product order creation | User has multiple products | Complete checkout with multiple products | Multiple products in cart | Order contains all products with correct quantities | | | | |
| COP033 | Checkout | Function | Verify order API call | User submits valid form | Monitor network for API request to orders endpoint | Valid form submission | API call made with correct data | | | | |
| COP034 | Checkout | Function | Verify order-product API call | User submits valid form | Monitor network for order-product API requests | Order with multiple products | API calls made for each product | | | | |
| COP035 | Checkout | Function | Verify tab navigation order | User is on checkout page | Press Tab repeatedly through the form | Form with focus on first field | Focus moves in logical order through form | | | | |
| COP036 | Checkout | Function | Verify Shift+Tab navigation | User is on checkout page | Press Shift+Tab repeatedly | Form with focus on last field | Focus moves backwards through form | | | | |
| COP037 | Checkout | Function | Verify Enter key functionality | User fills out form | Press Enter on Pay Now button | Completed form, focus on button | Form submits, order created | | | | |
| COP038 | Checkout | Function | Verify page refresh handling | User fills partial form | Refresh page during checkout | Partially completed form | Form data should persist (if implemented) | | | | |
| COP039 | Checkout | Function | Verify browser back button after checkout | User completes checkout | Use browser back button after checkout | Completed checkout | Should prevent duplicate order creation | | | | |
| COP040 | Checkout | Function | Verify double submission prevention | User is on checkout page | Click Pay Now button rapidly multiple times | Valid form data | Only one order should be created | | | | |
| COP041 | Checkout | Function | Verify loading states | User submits form | Check for loading indicators during submission | Valid form submission | Loading indicator shown during processing | | | | |
| COP042 | Checkout | Function | Verify API error handling | Server returns error | Simulate server error during checkout | Valid form, server error response | User-friendly error message displayed | | | | |
| COP043 | Checkout | Function | Verify network error handling | Network is disconnected | Submit form with no internet connection | Valid form, no connection | User-friendly network error message | | | | |
| COP044 | Checkout | Function | Verify mobile layout | User accesses on mobile | Check responsive design on mobile device | Mobile viewport | Layout adapts correctly for mobile | | | | |
| COP045 | Checkout | Function | Verify tablet layout | User accesses on tablet | Check responsive design on tablet device | Tablet viewport | Layout adapts correctly for tablet | | | | |
| COP046 | Checkout | Function | Verify desktop layout | User accesses on desktop | Check responsive design on desktop | Desktop viewport | Layout displays correctly for desktop | | | | |
| COP047 | Checkout | Function | Verify focused state of input fields | User interacts with form | Focus on different form fields | Tab through form | Focused field highlighted according to design | | | | |
| COP048 | Checkout | Function | Verify payment information section | User is on checkout page | Check payment section display | N/A | Payment section displayed with all fields | | | | |
| COP049 | Checkout | Function | Verify shipping information section | User is on checkout page | Check shipping section display | N/A | Shipping section displayed with all fields | | | | |
| COP050 | Checkout | Function | Verify contact information section | User is on checkout page | Check contact section display | N/A | Contact section displayed with all fields | | | | |
| COP051 | Checkout | Validate | Verify required field - name | User submits form | Submit form with empty name field | Empty name field | Error message for missing name | | | | |
| COP052 | Checkout | Validate | Verify required field - lastname | User submits form | Submit form with empty lastname field | Empty lastname field | Error message for missing lastname | | | | |
| COP053 | Checkout | Validate | Verify required field - phone | User submits form | Submit form with empty phone field | Empty phone field | Error message for missing phone | | | | |
| COP054 | Checkout | Validate | Verify required field - email | User submits form | Submit form with empty email field | Empty email field | Error message for missing email | | | | |
| COP055 | Checkout | Validate | Verify required field - card name | User submits form | Submit form with empty card name field | Empty card name field | Error message for missing card name | | | | |
| COP056 | Checkout | Validate | Verify required field - card number | User submits form | Submit form with empty card number field | Empty card number field | Error message for missing card number | | | | |
| COP057 | Checkout | Validate | Verify required field - expiration date | User submits form | Submit form with empty expiration date field | Empty expiration date field | Error message for missing expiration date | | | | |
| COP058 | Checkout | Validate | Verify required field - CVC | User submits form | Submit form with empty CVC field | Empty CVC field | Error message for missing CVC | | | | |
| COP059 | Checkout | Validate | Verify required field - company | User submits form | Submit form with empty company field | Empty company field | Error message for missing company | | | | |
| COP060 | Checkout | Validate | Verify required field - address | User submits form | Submit form with empty address field | Empty address field | Error message for missing address | | | | |
| COP061 | Checkout | Validate | Verify required field - apartment | User submits form | Submit form with empty apartment field | Empty apartment field | Error message for missing apartment | | | | |
| COP062 | Checkout | Validate | Verify required field - city | User submits form | Submit form with empty city field | Empty city field | Error message for missing city | | | | |
| COP063 | Checkout | Validate | Verify required field - country | User submits form | Submit form with empty country field | Empty country field | Error message for missing country | | | | |
| COP064 | Checkout | Validate | Verify required field - postal code | User submits form | Submit form with empty postal code field | Empty postal code field | Error message for missing postal code | | | | |
| COP065 | Checkout | Validate | Verify all fields empty | User submits form | Submit form with all fields empty | All fields empty | Error message for empty fields | | | | |
| COP066 | Checkout | Validate | Verify name format - valid | User enters name | Enter valid name format | "John Doe" | Input accepted with no errors | | | | |
| COP067 | Checkout | Validate | Verify name format - invalid numbers | User enters name | Enter name with numbers | "John123" | Error message for invalid name format | | | | |
| COP068 | Checkout | Validate | Verify name format - invalid special chars | User enters name | Enter name with special characters | "John@Doe" | Error message for invalid name format | | | | |
| COP069 | Checkout | Validate | Verify lastname format - valid | User enters lastname | Enter valid lastname format | "Smith" | Input accepted with no errors | | | | |
| COP070 | Checkout | Validate | Verify lastname format - invalid numbers | User enters lastname | Enter lastname with numbers | "Smith123" | Error message for invalid lastname format | | | | |
| COP071 | Checkout | Validate | Verify lastname format - invalid special chars | User enters lastname | Enter lastname with special characters | "Smith@!" | Error message for invalid lastname format | | | | |
| COP072 | Checkout | Validate | Verify email format - valid | User enters email | Enter valid email address | "test@example.com" | Input accepted with no errors | | | | |
| COP073 | Checkout | Validate | Verify email format - missing @ | User enters email | Enter email without @ symbol | "testexample.com" | Error message for invalid email format | | | | |
| COP074 | Checkout | Validate | Verify email format - missing domain | User enters email | Enter email without domain | "test@" | Error message for invalid email format | | | | |
| COP075 | Checkout | Validate | Verify email format - missing username | User enters email | Enter email without username | "@example.com" | Error message for invalid email format | | | | |
| COP076 | Checkout | Validate | Verify card name format - valid | User enters card name | Enter valid card name | "John Smith" | Input accepted with no errors | | | | |
| COP077 | Checkout | Validate | Verify card name format - invalid numbers | User enters card name | Enter card name with numbers | "John Smith123" | Error message for invalid card name format | | | | |
| COP078 | Checkout | Validate | Verify card name format - invalid special chars | User enters card name | Enter card name with special characters | "John Smith@" | Error message for invalid card name format | | | | |
| COP079 | Checkout | Validate | Verify card number format - valid (13 digits) | User enters card number | Enter valid 13-digit card number | "4111111111111" | Input accepted with no errors | | | | |
| COP080 | Checkout | Validate | Verify card number format - valid (16 digits) | User enters card number | Enter valid 16-digit card number | "4111111111111111" | Input accepted with no errors | | | | |
| COP081 | Checkout | Validate | Verify card number format - valid (19 digits) | User enters card number | Enter valid 19-digit card number | "4111111111111111111" | Input accepted with no errors | | | | |
| COP082 | Checkout | Business Rule | Verify subtotal calculation | User has products in cart | Check subtotal calculation | Products with various prices | Subtotal equals sum of (product price × quantity) | | | | |
| COP083 | Checkout | Business Rule | Verify shipping cost | User is on checkout page | Check shipping cost display | Products in cart | Shipping cost shown as $5 | | | | |
| COP084 | Checkout | Business Rule | Verify tax calculation | User is on checkout page | Check tax calculation | Products with various prices | Tax equals subtotal / 5 (20%) | | | | |
| COP085 | Checkout | Business Rule | Verify total calculation | User is on checkout page | Check total calculation | Products with various prices | Total equals subtotal + shipping + tax, rounded | | | | |
| COP086 | Checkout | Business Rule | Verify total with zero items | User has zero-priced items | Check total calculation | Products with $0 price | Total equals $0 | | | | |
| COP087 | Checkout | Business Rule | Verify order status | User completes checkout | Check initial order status | Successful order | Status set to "processing" | | | | |
| COP088 | Checkout | Business Rule | Verify order ID generation | User completes checkout | Check if order ID is generated | Successful order | Order ID created and returned from API | | | | |
| COP089 | Checkout | Business Rule | Verify order product linking | User completes checkout | Check order-product relationship | Multi-product order | Products linked to order with correct quantities | | | | |
| COP090 | Checkout | Business Rule | Verify high quantity order | User has high quantity product | Order with very high quantity | Product with quantity 999 | Order processes correctly with high quantity | | | | |
| COP091 | Checkout | Business Rule | Verify low price order | User has very low price items | Order with very low price | Product with price $0.01 | Order processes correctly with low price | | | | |
| COP092 | Checkout | UI | Verify breadcrumb display | User is on checkout page | Check breadcrumb path display | N/A | Breadcrumb shows "Home > Cart > Checkout" | | | | |
| COP093 | Checkout | UI | Verify page title | User is on checkout page | Check page title | N/A | Page title displays "Checkout" correctly | | | | |
| COP094 | Checkout | UI | Verify form labels alignment | User is on checkout page | Check alignment of form labels | N/A | Labels aligned consistently left of inputs | | | | |
| COP095 | Checkout | UI | Verify input field dimensions | User is on checkout page | Check width and height of input fields | N/A | Input fields have consistent dimensions | | | | |
| COP096 | Checkout | UI | Verify card fields styling | User is on checkout page | Check specialized styling for payment fields | N/A | Payment fields styled according to design | | | | |
| COP097 | Checkout | UI | Verify disabled fields styling | User views disabled fields | Check appearance of disabled fields | Fields in disabled state | Disabled fields have appropriate styling | | | | |
| COP098 | Checkout | UI | Verify split-screen background | User is on checkout page | Check large screen background split | Desktop viewport | Background split with white and gray | | | | |
| COP099 | Checkout | UI | Verify toast notification placement | User completes checkout | Check position of toast messages | Form submission | Toast messages appear at designated position | | | | |
| COP100 | Checkout | UI | Verify spacing between form sections | User is on checkout page | Check margin/padding between sections | N/A | Consistent spacing between form sections | | | | |
| COP101 | Checkout | UI | Verify form progress indicator | User is on checkout page | Check if checkout progress is shown | N/A | Progress indicator displayed if implemented | | | | |
| COP102 | Checkout | UI | Verify accessibility of UI elements | User with screen reader | Check if elements are properly labeled | Screen reader enabled | All elements have proper ARIA attributes | | | | |
| COP103 | Checkout | UI | Verify consistent border styling | User is on checkout page | Check borders on input fields | N/A | Borders have consistent style and color | | | | |
| COP104 | Checkout | UI | Verify text alignment in form fields | User enters information | Check text alignment in input fields | Text in input fields | Text properly aligned within fields | | | | |
| COP105 | Checkout | UI | Verify button size and positioning | User views Pay Now button | Check size and position of button | N/A | Button has appropriate size and position | | | | |

Bảng test cases này đã phủ đầy đủ các trường hợp về Function, Validation, Business Operation và UI cho quá trình Checkout. Tổng cộng đã tạo 105 test cases chi tiết với định dạng ID là COPxxx (Checkout Process), bao gồm:
- 30 test cases Function
- 30 test cases Validation
- 10 test cases Business Operation
- 35 test cases UI

Các test cases UI được thiết kế để kiểm tra đầy đủ các khía cạnh giao diện người dùng như bố cục, màu sắc, kích thước, căn chỉnh, phản hồi trực quan và tính nhất quán của thiết kế.
