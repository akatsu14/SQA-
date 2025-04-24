// Importing the deleteProduct function and PrismaClient
const { deleteProduct } = require('../controllers/products');
const { PrismaClient } = require('@prisma/client');

// Mocking the Prisma client and its relevant methods
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        customer_order_product: {
            findMany: jest.fn(), // Mock method to check related order items
        },
        product: {
            delete: jest.fn(), // Mock method to simulate product deletion
        },
        $disconnect: jest.fn(), // Mock method for disconnect cleanup
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

// Creating a new instance of the mocked Prisma client
const prisma = new PrismaClient();

describe('Delete Product Function', () => {
    // Clear mocks before each test to avoid interference between tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Disconnect Prisma client after all tests are done
    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should return 400 if product has related order items', async () => {
        // Simulate a product being linked to an order
        prisma.customer_order_product.findMany.mockResolvedValue([{ id: '1' }]);

        // Mock request and response
        const mockRequest = { params: { id: '1' } };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the deleteProduct function
        await deleteProduct(mockRequest, mockResponse);

        // Assert a 400 status and proper error message
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Cannot delete product because of foreign key constraint. ' });
        expect(prisma.product.delete).not.toHaveBeenCalled(); // Ensure delete was not called
    });

    test('should delete product if no related order items exist', async () => {
        // Simulate no related order items
        prisma.customer_order_product.findMany.mockResolvedValue([]);
        prisma.product.delete.mockResolvedValue({ id: '1' });

        // Mock request and response
        const mockRequest = { params: { id: '1' } };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        // Call the deleteProduct function
        await deleteProduct(mockRequest, mockResponse);

        // Assert that deletion was called correctly
        expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        expect(mockResponse.status).toHaveBeenCalledWith(204); // 204 No Content
        expect(mockResponse.send).toHaveBeenCalled(); // Ensure response is sent
    });

    test('should handle database errors', async () => {
        // Simulate a database error
        prisma.customer_order_product.findMany.mockRejectedValue(new Error('Database error'));
        const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation(() => { }); // Suppress error logs

        // Mock request and response
        const mockRequest = { params: { id: '1' } };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the deleteProduct function
        await deleteProduct(mockRequest, mockResponse);

        // Assert proper error response and logging
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: "Error deleting product" });
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

        consoleErrorSpy.mockRestore(); // Restore console logging
    });
});
