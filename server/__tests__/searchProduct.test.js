// Import the function and Prisma client
const { searchProducts } = require('../controllers/products');
const { PrismaClient } = require('@prisma/client');

// Mock the Prisma client
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        product: {
            findMany: jest.fn(), // Mock implementation of findMany
        },
        $disconnect: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

const prisma = new PrismaClient();

describe('Search Products Function', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test to avoid contamination
    });

    afterAll(async () => {
        await prisma.$disconnect(); // Disconnect Prisma after all tests
    });

    test('should return 400 if no query parameter is provided', async () => {
        // Simulate request without query parameter
        const mockRequest = { query: {} };
        const mockResponse = {
            status: jest.fn().mockReturnThis(), // Allow method chaining
            json: jest.fn(),
        };

        await searchProducts(mockRequest, mockResponse); // Call controller

        // Expect 400 Bad Request response
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: "Query parameter is required" });
        // Ensure database function wasn't called
        expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    test('should return products matching the query', async () => {
        // Mock matched products
        const mockProducts = [
            { id: '1', title: 'Test Product', description: 'A sample product' },
        ];
        prisma.product.findMany.mockResolvedValue(mockProducts); // Simulate DB return

        const mockRequest = { query: { query: 'Test' } }; // Provide query param
        const mockResponse = { json: jest.fn() }; // Mock response

        await searchProducts(mockRequest, mockResponse); // Call controller

        // Expect findMany to be called with OR query
        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { title: { contains: 'Test' } },
                    { description: { contains: 'Test' } },
                ],
            },
        });
        // Expect returned products to be sent in response
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should return empty array if no products match', async () => {
        prisma.product.findMany.mockResolvedValue([]); // No matching results

        const mockRequest = { query: { query: 'NonExistent' } }; // Non-matching query
        const mockResponse = { json: jest.fn() };

        await searchProducts(mockRequest, mockResponse); // Call controller

        // Expect empty array in response
        expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    test('should handle database errors', async () => {
        prisma.product.findMany.mockRejectedValue(new Error('Database error')); // Simulate DB error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { }); // Silence error output

        const mockRequest = { query: { query: 'Test' } };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await searchProducts(mockRequest, mockResponse); // Call controller

        // Expect server error response
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: "Error searching products" });
        // Ensure error is logged
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error searching products:", expect.any(Error));

        consoleErrorSpy.mockRestore(); // Restore console.error
    });
});
