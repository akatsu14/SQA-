const { updateProduct } = require('../controllers/products');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma client to isolate test environment from actual database
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        product: {
            findUnique: jest.fn(),  // Mock method to simulate finding a product
            update: jest.fn(),      // Mock method to simulate updating a product
        },
        $disconnect: jest.fn(),      // Mock method to simulate disconnecting from the database
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

const mockedPrisma = new PrismaClient();

describe('updateProduct Function', () => {
    // Test constants for product and category IDs
    const PRODUCT_ID = 'test-product-id';
    const CATEGORY_ID = 'test-category-id';

    // Simulated existing product data
    const EXISTING_PRODUCT = {
        id: PRODUCT_ID,
        slug: 'existing-product',
        title: 'Existing Product',
        mainImage: 'existing.jpg',
        price: 100,
        rating: 3,
        description: 'Existing description',
        manufacturer: 'Existing Manufacturer',
        inStock: 10,
        categoryId: CATEGORY_ID,
        category: {
            name: 'Existing Category'
        }
    };

    // Update payload
    const UPDATE_DATA = {
        slug: 'updated-product',
        title: 'Updated Product',
        mainImage: 'updated.jpg',
        price: 200,
        rating: 4,
        description: 'Updated description',
        manufacturer: 'Updated Manufacturer',
        categoryId: CATEGORY_ID,
        inStock: 20
    };

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Close connection after all tests are done
    afterAll(async () => {
        await mockedPrisma.$disconnect();
    });

    test('should successfully update a product', async () => {
        // Simulate existing product found
        mockedPrisma.product.findUnique.mockResolvedValue(EXISTING_PRODUCT);
        // Simulate updated product return
        mockedPrisma.product.update.mockResolvedValue({
            ...EXISTING_PRODUCT,
            ...UPDATE_DATA
        });

        // Mock request and response
        const mockRequest = {
            params: { id: PRODUCT_ID },
            body: UPDATE_DATA
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Execute controller
        await updateProduct(mockRequest, mockResponse);

        // Verify methods were called with correct arguments
        expect(mockedPrisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: PRODUCT_ID }
        });

        expect(mockedPrisma.product.update).toHaveBeenCalledWith({
            where: { id: PRODUCT_ID },
            data: UPDATE_DATA
        });

        // Verify response
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            ...EXISTING_PRODUCT,
            ...UPDATE_DATA
        });
    });

    test('should return 404 if product not found', async () => {
        // Simulate product not found
        mockedPrisma.product.findUnique.mockResolvedValue(null);

        const mockRequest = {
            params: { id: PRODUCT_ID },
            body: UPDATE_DATA
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Execute controller
        await updateProduct(mockRequest, mockResponse);

        // Verify response for not found
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Product not found"
        });
        // Ensure update was not called
        expect(mockedPrisma.product.update).not.toHaveBeenCalled();
    });

    test('should handle partial updates', async () => {
        const partialUpdate = {
            title: 'Partially Updated',
            price: 150
        };

        mockedPrisma.product.findUnique.mockResolvedValue(EXISTING_PRODUCT);
        mockedPrisma.product.update.mockResolvedValue({
            ...EXISTING_PRODUCT,
            ...partialUpdate
        });

        const mockRequest = {
            params: { id: PRODUCT_ID },
            body: partialUpdate
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await updateProduct(mockRequest, mockResponse);

        expect(mockedPrisma.product.update).toHaveBeenCalledWith({
            where: { id: PRODUCT_ID },
            data: partialUpdate
        });
    });

    test('should return 500 on database error', async () => {
        // Simulate a DB error
        mockedPrisma.product.findUnique.mockRejectedValue(new Error('DB Error'));

        const mockRequest = {
            params: { id: PRODUCT_ID },
            body: UPDATE_DATA
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Execute
        await updateProduct(mockRequest, mockResponse);

        // Verify error response
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Error updating product"
        });
    });

    test('should maintain category relation', async () => {
        const updateWithCategory = {
            ...UPDATE_DATA,
            categoryId: 'new-category-id'
        };

        mockedPrisma.product.findUnique.mockResolvedValue(EXISTING_PRODUCT);
        mockedPrisma.product.update.mockResolvedValue({
            ...EXISTING_PRODUCT,
            ...updateWithCategory
        });

        const mockRequest = {
            params: { id: PRODUCT_ID },
            body: updateWithCategory
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await updateProduct(mockRequest, mockResponse);

        expect(mockedPrisma.product.update).toHaveBeenCalledWith({
            where: { id: PRODUCT_ID },
            data: {
                ...updateWithCategory,
                // Category relation is assumed to be maintained externally
                category: undefined
            }
        });
    });
});
