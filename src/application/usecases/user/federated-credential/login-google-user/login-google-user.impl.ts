import { resolveUserNames } from "@application/utils";
import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { verifyIdTokenAndGetPayload } from "@infrastructure/external/auth/google";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { IUserRedisRepository } from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { OAuth2Client } from "google-auth-library";
import { inject, injectable } from "inversify";
import { LoginGoogleUserRequest } from "./login-google-user.request";
import { LoginGoogleUserResponse } from "./login-google-user.response";
import { ILoginGoogleUserUseCase } from "./login-google-user.usecase";

@injectable()
export class LoginGoogleUserUseCase implements ILoginGoogleUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserRedisRepository)
    private userRedisRepository: IUserRedisRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger,
    @inject(TYPES.OAuth2Client) private oauth2Client: OAuth2Client
  ) {}

  async execute({
    code,
  }: LoginGoogleUserRequest): Promise<LoginGoogleUserResponse> {
    const tokenPayload = await verifyIdTokenAndGetPayload(
      this.oauth2Client,
      code
    );

    if (!tokenPayload) {
      this.logger.error("Failed to verify id token");
      return {
        error: "Failed to verify id token",
        data: null,
      };
    }

    const { email, family_name, given_name, name, picture, userId } =
      tokenPayload;

    // Users are identified by email, and it is the last fallback for required names.
    if (!email?.trim()) {
      this.logger.error("Google id token has no email");
      return {
        error: "Failed to login",
        data: null,
      };
    }

    // Check if the email is existed in the database
    const foundUser = await this.userRepository.findUserByEmail(email);

    // If the user does not exist, create new federated credential user.
    if (!foundUser.value) {
      const names = resolveUserNames({
        givenName: given_name,
        familyName: family_name,
        fullName: name,
        email,
      });

      const user = await User.create({
        email,
        firstName: names.firstName,
        lastName: names.lastName,
        avatar: picture,
        provider: "GOOGLE",
        providerUserId: userId,
      });

      const newFederatedCredentialUser =
        await this.userRepository.createFederatedCredentialUser(user);

      if (newFederatedCredentialUser.error) {
        return {
          error: "Failed to login",
          data: null,
        };
      }

      const {
        id,
        email: _email,
        firstName,
        lastName,
        avatar,
        provider,
        providerUserId,
        status,
        role,
        isActive,
      } = newFederatedCredentialUser.value;

      const federatedUser = new User({
        id,
        email: _email,
        firstName,
        lastName,
        avatar,
        provider,
        providerUserId,
        status,
        role,
        isActive,
      });

      this.userRedisRepository.setUser(federatedUser);

      return {
        data: newFederatedCredentialUser.value,
      };
    }

    return {
      data: foundUser.value,
    };
  }
}
