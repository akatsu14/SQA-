// Import the function to test and Prisma client
const { searchProducts } = require('../controllers/search');
const { PrismaClient } = require('@prisma/client');

// Mock the Prisma client to avoid actual database calls during testing
jest.mock('@prisma/client', () => {
    // Create a mock Prisma client with only the methods we need
    const mockPrisma = {
        product: {
            findMany: jest.fn(), // Mock the findMany method for products
        },
        $disconnect: jest.fn(), // Mock the disconnect method
    };
    return {
        // Return a mock PrismaClient constructor
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

// Create an instance of the mocked Prisma client
const prisma = new PrismaClient();

describe('Search Products Function', () => {
    // Before each test, clear all mock calls and implementations
    beforeEach(() => {
        jest.clearAllMocks(); // Resets all mock call histories
    });

    // After all tests, disconnect from the mocked Prisma client
    afterAll(async () => {
        await prisma.$disconnect(); // Clean up after tests
    });

    // Test case: Should return 400 error when no search query is provided
    it('TCSH01: should return 400 error when no query is provided', async () => {
        // Setup mock request with empty query
        const mockRequest = {
            query: {} // No query parameter
        };
        // Setup mock response with Jest spies
        const mockResponse = {
            status: jest.fn().mockReturnThis(), // Chainable status method
            json: jest.fn() // json method spy
        };

        // Execute the function with mock request/response
        await searchProducts(mockRequest, mockResponse);

        // Assertions:
        // 1. Should return 400 status code
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        // 2. Should return error message
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Query parameter is required"
        });
        // 3. Should not call the database
        expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    // Test case: Should successfully search products by title or description
    it('TCSH02: should search products by title or description', async () => {
        // Mock product data that matches our schema
        const mockProducts = [{
            id: '1',
            title: 'Test Product',
            description: 'This is a test product',
            price: 100,
            categoryId: '1',
        }];

        // Mock the Prisma findMany to return our test data
        prisma.product.findMany.mockResolvedValue(mockProducts);

        // Setup mock request with search query
        const mockRequest = {
            query: { query: 'Test' } // Search for "Test"
        };
        // Setup mock response
        const mockResponse = {
            json: jest.fn() // Only need to spy on json for this test
        };

        // Execute the function
        await searchProducts(mockRequest, mockResponse);

        // Assertions:
        // 1. Should call Prisma with correct search conditions
        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { title: { contains: 'Test' } }, // Search in title
                    { description: { contains: 'Test' } } // Search in description
                ]
            }
        });
        // 2. Should return the mock products
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    // Test case: Should handle empty results gracefully
    it('TCSH03: should return empty array if no products match', async () => {
        // Mock empty array response from Prisma
        prisma.product.findMany.mockResolvedValue([]);

        // Setup mock request with query that won't match anything
        const mockRequest = {
            query: { query: 'NonExistent' }
        };
        // Setup mock response
        const mockResponse = {
            json: jest.fn()
        };

        // Execute the function
        await searchProducts(mockRequest, mockResponse);

        // Assertion: Should return empty array
        expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    // Test case: Should handle database errors properly
    it('TCSH04: should handle database errors', async () => {
        // Mock a database error
        prisma.product.findMany.mockRejectedValue(new Error('Database error'));

        // Mock console.error to prevent actual error logging and to verify it's called
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Setup mock request
        const mockRequest = {
            query: { query: 'Test' }
        };
        // Setup mock response
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Execute the function
        await searchProducts(mockRequest, mockResponse);

        // Assertions:
        // 1. Should return 500 status code for errors
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        // 2. Should return error message
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Error searching products"
        });
        // 3. Should log the error to console
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error searching products:",
            expect.any(Error) // Verify an Error object was logged
        );

        // Restore the original console.error implementation
        consoleErrorSpy.mockRestore();
    });
});