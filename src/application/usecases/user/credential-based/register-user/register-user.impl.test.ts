import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { RegisterCredentialBasedUserUseCase } from "./register-user.impl";

// query-string ships as ESM only, which ts-jest doesn't transform.
jest.mock("query-string", () => ({
  __esModule: true,
  default: { stringify: () => "" },
}));

describe("RegisterCredentialBasedUserUseCase", () => {
  let userRepository: jest.Mocked<
    Pick<IUserRepository, "createCredentialBasedUser">
  >;
  let logger: jest.Mocked<Pick<ILogger, "error">>;
  let useCase: RegisterCredentialBasedUserUseCase;

  beforeEach(() => {
    userRepository = { createCredentialBasedUser: jest.fn() };
    logger = { error: jest.fn() };
    useCase = new RegisterCredentialBasedUserUseCase(
      userRepository as unknown as IUserRepository,
      logger as unknown as ILogger
    );
  });

  it.each([
    ["", "Hoang"],
    ["Trung", "   "],
  ])(
    "rejects a blank first or last name (%p, %p)",
    async (firstName, lastName) => {
      const result = await useCase.execute({
        email: "trung@example.com",
        firstName,
        lastName,
        password: "secret",
      });

      expect(result).toEqual({
        data: null,
        error: "First name and last name are required",
      });
      expect(userRepository.createCredentialBasedUser).not.toHaveBeenCalled();
    }
  );

  it("creates the user with trimmed names", async () => {
    userRepository.createCredentialBasedUser.mockImplementation(
      async (user: User) => ({ value: user })
    );

    const result = await useCase.execute({
      email: "trung@example.com",
      firstName: "  Trung ",
      lastName: " Hoang",
      password: "secret",
    });

    expect(result.error).toBeUndefined();
    const created = userRepository.createCredentialBasedUser.mock.calls[0][0];
    expect(created.firstName).toBe("Trung");
    expect(created.lastName).toBe("Hoang");
  });
});
