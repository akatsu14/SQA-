// Import the function to test and Prisma client
const { createProduct } = require('../controllers/products');
const { PrismaClient } = require('@prisma/client');

/**
 * Mock the Prisma client to isolate tests from database operations
 * This replaces all Prisma client instances with our mock implementation
 */
jest.mock('@prisma/client', () => {
    // Define mock implementations of Prisma methods we'll use
    const mockPrisma = {
        product: {
            create: jest.fn(), // Mock product creation
            findMany: jest.fn(), // Mock product listing (if needed)
        },
        $disconnect: jest.fn(), // Mock database disconnection
    };
    return {
        // Return a mock constructor that returns our mock instance
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

// Create an instance of our mocked Prisma client
const prisma = new PrismaClient();

// Test suite for createProduct function
describe('createProduct Function', () => {
    /**
     * Mock product data that matches the Prisma schema
     * Includes all required fields based on your schema.prisma
     */
    const mockProductData = {
        slug: 'test-product',       // Required unique string
        title: 'Test Product',      // Required string
        mainImage: 'test.jpg',      // Required string
        price: 200,                // Required integer with default 0
        description: 'Test description', // Required string
        manufacturer: 'Test Manufacturer', // Required string
        categoryId: 'test-category-id', // Required string (foreign key)
        inStock: 5,                 // Required integer with default 1
    };

    /**
     * Mock response data that includes generated fields
     * Simulates what Prisma would return after creation
     */
    const mockCreatedProduct = {
        id: 'test-product-id',      // Mock generated UUID
        ...mockProductData,
        rating: 5,                  // Default value from controller
    };

    /**
     * Before each test, reset all mock states
     * This ensures tests are isolated and don't affect each other
     */
    beforeEach(() => {
        jest.clearAllMocks(); // Clears call history and mock implementations

        // Mock console.error to prevent test output pollution
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    /**
     * After all tests complete, clean up resources
     */
    afterAll(async () => {
        await prisma.$disconnect(); // Call mocked disconnect
        console.error.mockRestore(); // Restore original console.error
    });

    /**
     * Test Case: Successful Product Creation
     * Verifies that:
     * 1. The function makes correct Prisma query
     * 2. Returns proper 201 status code
     * 3. Returns the created product data
     */
    it("TCCP01: should create a new product with valid data", async () => {
        // Configure mock to return our test product
        prisma.product.create.mockResolvedValue(mockCreatedProduct);

        // Mock Express request/response objects
        const mockRequest = { body: mockProductData };
        const mockResponse = {
            status: jest.fn().mockReturnThis(), // Chainable status()
            json: jest.fn() // Spy on json response
        };

        // Execute the function
        await createProduct(mockRequest, mockResponse);

        // Verify Prisma was called with correct data
        expect(prisma.product.create).toHaveBeenCalledWith({
            data: {
                ...mockProductData,
                rating: 5, // Verify default rating is set
            },
        });

        // Verify HTTP response
        expect(mockResponse.status).toHaveBeenCalledWith(201); // Created status
        expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedProduct);
    });

    /**
     * Test Case: Missing Required Fields
     * Verifies that:
     * 1. The function handles validation errors
     * 2. Returns proper 500 status code
     * 3. Returns error message
     */
    it("TCCP02: should handle missing required fields", async () => {
        // Create incomplete data by removing required field
        const incompleteData = { ...mockProductData };
        delete incompleteData.title; // Remove required title field

        // Mock Prisma to throw validation error
        prisma.product.create.mockRejectedValue(new Error('Validation error'));

        const mockRequest = { body: incompleteData };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await createProduct(mockRequest, mockResponse);

        // Verify error response
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Error creating product"
        });
    });

    /**
     * Test Case: Default Rating Value
     * Verifies that:
     * 1. The function sets default rating to 5
     * 2. Works correctly when rating isn't provided
     */
    it("TCCP03: should set default rating to 5", async () => {
        // Create data without rating
        const productWithoutRating = { ...mockProductData };
        delete productWithoutRating.rating;

        // Mock response with default rating
        prisma.product.create.mockResolvedValue({
            ...mockCreatedProduct,
            rating: 5
        });

        const mockRequest = { body: productWithoutRating };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await createProduct(mockRequest, mockResponse);

        // Verify default rating was set
        expect(prisma.product.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                rating: 5 // Should include default rating
            })
        });
    });
});