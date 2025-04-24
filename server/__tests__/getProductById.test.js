const { getProductById } = require('../controllers/products');
const { PrismaClient } = require('@prisma/client');

// Mocking PrismaClient and its methods
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        product: {
            findUnique: jest.fn(), // Mock findUnique method for product
        },
        $disconnect: jest.fn(), // Mock $disconnect to avoid actual DB disconnection
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

const prisma = new PrismaClient();

describe('Get Product By ID Function', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
    });

    afterAll(async () => {
        await prisma.$disconnect(); // Clean up Prisma connection after all tests
    });

    test('should return 404 if product is not found', async () => {
        // Simulate no product found in the database
        prisma.product.findUnique.mockResolvedValue(null);

        const mockRequest = { params: { id: '1' } }; // Simulate request with product id param
        const mockResponse = {
            status: jest.fn().mockReturnThis(), // Mock chainable status method
            json: jest.fn(), // Mock json method to capture response
        };

        await getProductById(mockRequest, mockResponse);

        // Expect 404 status and proper error message
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    test('should return product if found', async () => {
        // Mock product to be returned
        const mockProduct = {
            id: '1',
            title: 'Test Product',
            category: { name: 'Test Category' },
        };

        // Simulate successful DB response
        prisma.product.findUnique.mockResolvedValue(mockProduct);

        const mockRequest = { params: { id: '1' } }; // Request with ID param
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getProductById(mockRequest, mockResponse);

        // Expect 200 status and the returned product
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    test('should call findUnique with correct id and include category', async () => {
        // Provide a mock product for test
        const mockProduct = {
            id: '1',
            title: 'Product With Category',
            category: { name: 'Category Name' },
        };

        // Resolve mocked product from DB call
        prisma.product.findUnique.mockResolvedValue(mockProduct);

        const mockRequest = { params: { id: '1' } }; // Simulated request
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getProductById(mockRequest, mockResponse);

        // Ensure DB query is made with correct parameters
        expect(prisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
            include: { category: true },
        });
    });
});
