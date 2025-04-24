// Import the function to test from controllers
const { getAllProductsOld } = require('../controllers/products');
// Import PrismaClient for type reference and mocking
const { PrismaClient } = require('@prisma/client');

/**
 * Mock the Prisma client to isolate tests from actual database operations
 * This replaces all Prisma client instances with our mock implementation
 */
jest.mock('@prisma/client', () => {
    // Define mock implementations of Prisma methods we'll use
    const mockPrisma = {
        product: {
            findMany: jest.fn(), // Mock the product.findMany method
        },
        $disconnect: jest.fn(), // Mock the disconnect method
    };
    return {
        // Return a mock constructor that returns our mock instance
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

// Create an instance of our mocked Prisma client
const prisma = new PrismaClient();

// Test suite for getAllProductsOld function
describe('getAllProductsOld Function', () => {
    /**
     * Mock product data that matches the Prisma schema
     * Includes all required fields and a nested category relation
     */
    const mockProducts = [
        {
            id: 'test-product-id',
            slug: 'test-product',
            title: 'Test Product',
            mainImage: 'test.jpg',
            price: 200,
            rating: 4,
            description: 'Test description',
            manufacturer: 'Test Manufacturer',
            inStock: 5,
            categoryId: 'test-category-id',
            category: {  // Nested category data
                name: 'Test Category',
            },
        }
    ];

    // Reset all mock states before each test
    beforeEach(() => {
        jest.clearAllMocks(); // Clears call history and mock implementations
    });

    // Clean up after all tests complete
    afterAll(async () => {
        await prisma.$disconnect(); // Call mocked disconnect
    });

    /**
     * Test Case: Successful product retrieval
     * Verifies the function:
     * 1. Makes correct Prisma query
     * 2. Returns proper status code
     * 3. Returns expected product data
     */
    test('should fetch all products with categories', async () => {
        // Configure mock to return our test products
        prisma.product.findMany.mockResolvedValue(mockProducts);

        // Mock Express request/response objects
        const mockRequest = {}; // Empty request
        const mockResponse = {
            status: jest.fn().mockReturnThis(), // Chainable status()
            json: jest.fn() // Spy on json response
        };

        // Execute the function
        await getAllProductsOld(mockRequest, mockResponse);

        // Verify Prisma was called with correct query
        expect(prisma.product.findMany).toHaveBeenCalledWith({
            include: {
                category: {
                    select: {
                        name: true, // Should only select category name
                    },
                },
            },
        });

        // Verify HTTP response
        expect(mockResponse.status).toHaveBeenCalledWith(200); // Success status
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts); // Correct data
    });

    /**
     * Test Case: Category inclusion verification
     * Ensures the response includes category names
     */
    test('should include category name in response', async () => {
        prisma.product.findMany.mockResolvedValue(mockProducts);

        const mockRequest = {};
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAllProductsOld(mockRequest, mockResponse);

        // Get first argument from first json() call
        const responseData = mockResponse.json.mock.calls[0][0];

        // Verify category data exists and is correct
        expect(responseData[0].category).toBeDefined();
        expect(responseData[0].category.name).toBe('Test Category');
    });

    /**
     * Test Case: Empty product list
     * Verifies proper handling when no products exist
     */
    test('should return empty array when no products exist', async () => {
        // Mock empty array response
        prisma.product.findMany.mockResolvedValue([]);

        const mockRequest = {};
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAllProductsOld(mockRequest, mockResponse);

        // Should return empty array, not null or undefined
        expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    /**
     * Test Case: Database error handling
     * Verifies error logging behavior
     * Note: Current implementation only logs errors (should be enhanced)
     */
    test('should handle database errors', async () => {
        // Simulate database failure
        prisma.product.findMany.mockRejectedValue(new Error('Database error'));

        // Mock console.log to verify error logging
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        const mockRequest = {};
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAllProductsOld(mockRequest, mockResponse);

        // Verify error was logged
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));

        // TODO: Should also verify error response is sent
        // Currently only logs error without responding to client

        // Restore original console.log
        consoleLogSpy.mockRestore();
    });
});