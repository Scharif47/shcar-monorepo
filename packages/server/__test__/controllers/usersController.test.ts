// Mock object for the User model
class User {
  static find = jest.fn();
}

jest.mock("../../src/models/User", () => User); // Mock default export

import { getUsers } from "../../src/controllers/usersController";

describe("getUsers", () => {
  it("should return all users", async () => {
    // Arrange
    const mockUsers = [
      { id: "1", name: "User 1" },
      { id: "2", name: "User 2" },
    ];

    // Implementation for the find method
    User.find.mockResolvedValue(mockUsers);

    const req = {} as any;
    const res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    } as any;

    // Act
    await getUsers(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it("should return 500 if an error occurs while fetching all users", async () => {
    // Arrange
    const mockError = new Error("An error occurred");
    (User.find as jest.MockedFunction<typeof User.find>).mockRejectedValue(
      mockError
    );

    const req = {} as any;
    const res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    } as any;

    // Act
    await getUsers(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
  });
});
