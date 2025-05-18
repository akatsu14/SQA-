const { uploadMainImage } = require("../controllers/mainImages"); // Ensure correct path
const httpMocks = require("node-mocks-http"); // Utility library for mock req/res
// const jest = require('jest-mock'); // Uncomment if using jest-mock for mock functions

// Mock the `mv` function of the simulated file object
// This allows us to control its success or failure behavior
const mockMoveFile = jest.fn((path, callback) => {
  // Default behavior: success (callback without error)
  callback(null);
});

// --- Test Suite ---
describe("Main Images Controller - uploadMainImage", () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    // Create new mock request and response for each test
    mockRequest = httpMocks.createRequest();
    mockResponse = httpMocks.createResponse();

    // Reset mock function before each test to avoid interference
    mockMoveFile.mockClear();
    // Reset default behavior to success
    mockMoveFile.mockImplementation((path, callback) => callback(null));
  });

  afterEach(() => {
    // Restore all mocks created with jest.spyOn or jest.fn
    jest.restoreAllMocks(); // Ensures clean state
  });

  // Test Case TCMI01: No files uploaded
  it("TCMI01: should return 400 if no files are uploaded", () => {
    // Call the controller function with no files in the request
    uploadMainImage(mockRequest, mockResponse);

    // Assert the response status and message
    expect(mockResponse.statusCode).toBe(400);
    expect(mockResponse._getJSONData()).toEqual({
      message: "Nema otpremljenih fajlova",
    });
  });

  // Test Case TCMI02: Empty files object
  it("TCMI02: should return 400 if req.files is an empty object", () => {
    // Assign an empty object to req.files
    mockRequest.files = {};

    uploadMainImage(mockRequest, mockResponse);

    // Assert the response status and message
    expect(mockResponse.statusCode).toBe(400);
    expect(mockResponse._getJSONData()).toEqual({
      message: "Nema otpremljenih fajlova",
    });
  });

  // Test Case TCMI03: Successful file upload
  it("TCMI03: should call mv with the correct path and return 200 on successful upload", () => {
    const testFileName = "test-image.jpg";
    // Simulate a file object in req.files
    mockRequest.files = {
      uploadedFile: {
        name: testFileName,
        mv: mockMoveFile, // Use the mock function
      },
    };

    // Call the controller function
    uploadMainImage(mockRequest, mockResponse);

    // Assert that mv was called once with the correct path
    expect(mockMoveFile).toHaveBeenCalledTimes(1);
    expect(mockMoveFile).toHaveBeenCalledWith(
      `../public/${testFileName}`, // Expected destination path
      expect.any(Function) // Second argument is a callback function
    );

    // Assert the response status and message
    expect(mockResponse.statusCode).toBe(200);
    expect(mockResponse._getJSONData()).toEqual({
      message: "Fajl je uspešno otpremljen",
    });

    // Placeholder for rollback or database checks if needed
    // Example: expect(checkDatabase()).toBe(true);
  });

  // Test Case TCMI04: File upload failure due to mv error
  it("TCMI04: should return 500 if mv function encounters an error", () => {
    const testFileName = "error-image.png";
    const simulatedError = new Error("Disk full"); // Simulated error

    // Simulate a file object
    mockRequest.files = {
      uploadedFile: {
        name: testFileName,
        mv: mockMoveFile, // Use the mock function
      },
    };

    // Change mockMoveFile behavior to simulate an error
    mockMoveFile.mockImplementation((path, callback) => {
      callback(simulatedError); // Call callback with the simulated error
    });

    // Call the controller function
    uploadMainImage(mockRequest, mockResponse);

    // Assert that mv was called once with the correct path
    expect(mockMoveFile).toHaveBeenCalledTimes(1);
    expect(mockMoveFile).toHaveBeenCalledWith(
      `../public/${testFileName}`,
      expect.any(Function)
    );

    // Assert the response status and error message
    expect(mockResponse.statusCode).toBe(500);
    expect(mockResponse._getData()).toBe(simulatedError); // Controller sends the error object directly

    // Placeholder for rollback or database checks if needed
    // Example: expect(checkRollback()).toBe(true);
  });
});
