const { getAllProducts } = require('../controllers/products');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma client to simulate database interactions without connecting to a real DB
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        product: {
            findMany: jest.fn(), // Mock implementation for findMany method
        },
        $disconnect: jest.fn(), // Mock disconnect method
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

const prisma = new PrismaClient();

describe('Get All Products Function', () => {
    // Reset all mocks before each test to avoid mock data leaking between tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // After all tests, disconnect the mocked Prisma client
    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should return all products in admin mode', async () => {
        // Arrange: Set up mock data and mock request/response
        const mockProducts = [
            { id: '1', title: 'Product 1' },
            { id: '2', title: 'Product 2' },
        ];
        prisma.product.findMany.mockResolvedValue(mockProducts);

        const mockRequest = {
            query: { mode: 'admin' }, // Simulating "admin" mode in the query
        };
        const mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        // Act: Call the function under test
        await getAllProducts(mockRequest, mockResponse);

        // Assert: Ensure findMany was called with an empty object and response returned all products
        expect(prisma.product.findMany).toHaveBeenCalledWith({});
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should handle database error in admin mode', async () => {
        // Arrange: Simulate a DB error by rejecting the promise
        prisma.product.findMany.mockRejectedValue(new Error('DB error'));

        const mockRequest = {
            query: { mode: 'admin' },
        };
        const mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        // Act: Call the function
        await getAllProducts(mockRequest, mockResponse);

        // Assert: Function should respond with a 500 error and an appropriate error message
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error fetching products' });
    });

    test('should call findMany with pagination and sorting (non-admin mode)', async () => {
        // Arrange: Simulate request with query parameters including pagination and sorting
        const mockProducts = [
            { id: '1', title: 'Product 1', category: { name: 'Cat 1' } },
        ];
        prisma.product.findMany.mockResolvedValue(mockProducts);

        const mockRequest = {
            query: { page: '2' }, // Requesting page 2
            url: '/api/products?page=2&sort=titleAsc', // Sorting by title ascending
        };

        const mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        // Act: Call getAllProducts in non-admin mode with pagination and sorting
        await getAllProducts(mockRequest, mockResponse);

        // Assert: Ensure the correct pagination, sorting, and inclusion of category are applied
        expect(prisma.product.findMany).toHaveBeenCalledWith({
            skip: 10, // (page - 1) * 10 => (2 - 1) * 10 = 10
            take: 12,
            include: { category: { select: { name: true } } },
            orderBy: { title: 'asc' }, // Sorting by title in ascending order
        });
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });
});
