import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { verifyIdTokenAndGetPayload } from "@infrastructure/external/auth/google";
import { IUserRedisRepository } from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { OAuth2Client } from "google-auth-library";
import { LoginGoogleUserUseCase } from "./login-google-user.impl";

jest.mock("@infrastructure/external/auth/google", () => ({
  verifyIdTokenAndGetPayload: jest.fn(),
}));

const mockedVerify = verifyIdTokenAndGetPayload as jest.MockedFunction<
  typeof verifyIdTokenAndGetPayload
>;

type TokenPayload = Awaited<ReturnType<typeof verifyIdTokenAndGetPayload>>;

describe("LoginGoogleUserUseCase", () => {
  let userRepository: jest.Mocked<
    Pick<IUserRepository, "findUserByEmail" | "createFederatedCredentialUser">
  >;
  let userRedisRepository: jest.Mocked<Pick<IUserRedisRepository, "setUser">>;
  let useCase: LoginGoogleUserUseCase;

  beforeEach(() => {
    mockedVerify.mockReset();
    userRepository = {
      findUserByEmail: jest.fn().mockResolvedValue({ value: null }),
      createFederatedCredentialUser: jest
        .fn()
        .mockImplementation(async (user: User) => ({ value: user })),
    };
    userRedisRepository = { setUser: jest.fn() };
    useCase = new LoginGoogleUserUseCase(
      userRepository as unknown as IUserRepository,
      userRedisRepository as unknown as IUserRedisRepository,
      { error: jest.fn() } as unknown as ILogger,
      {} as OAuth2Client
    );
  });

  const createdUser = (): User =>
    userRepository.createFederatedCredentialUser.mock.calls[0][0];

  it("stores the given name as first name and the family name as last name", async () => {
    mockedVerify.mockResolvedValue({
      email: "trung@example.com",
      given_name: "Trung",
      family_name: "Hoang",
      name: "Trung Hoang",
      userId: "google-1",
    } as TokenPayload);

    await useCase.execute({ code: "code" });

    expect(createdUser().firstName).toBe("Trung");
    expect(createdUser().lastName).toBe("Hoang");
  });

  it("falls back when Google gives no family name", async () => {
    mockedVerify.mockResolvedValue({
      email: "trung@example.com",
      given_name: "Trung",
      name: "Trung",
      userId: "google-1",
    } as TokenPayload);

    await useCase.execute({ code: "code" });

    expect(createdUser().firstName).toBe("Trung");
    expect(createdUser().lastName).toBe("trung");
  });

  it("rejects a token without an email", async () => {
    mockedVerify.mockResolvedValue({
      given_name: "Trung",
      userId: "google-1",
    } as TokenPayload);

    const result = await useCase.execute({ code: "code" });

    expect(result).toEqual({ data: null, error: "Failed to login" });
    expect(userRepository.findUserByEmail).not.toHaveBeenCalled();
    expect(userRepository.createFederatedCredentialUser).not.toHaveBeenCalled();
  });

  it("returns the existing user without creating one", async () => {
    const existing = { id: "u1" } as User;
    userRepository.findUserByEmail.mockResolvedValue({ value: existing });
    mockedVerify.mockResolvedValue({
      email: "trung@example.com",
      userId: "google-1",
    } as TokenPayload);

    const result = await useCase.execute({ code: "code" });

    expect(result.data).toBe(existing);
    expect(userRepository.createFederatedCredentialUser).not.toHaveBeenCalled();
  });
});
