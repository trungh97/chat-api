import { OAuth2Client } from "google-auth-library";
import { inject, injectable } from "inversify";

import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { ILoginGoogleUserUseCase } from "@domain/usecases/user/federated-credential";
import { verifyIdTokenAndGetPayload } from "@infrastructure/external/auth/google";
import { TYPES } from "@infrastructure/external/di/inversify";
import { IUserRedisRepository } from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";

@injectable()
export class LoginGoogleUserUseCase implements ILoginGoogleUserUseCase {
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserRedisRepository)
    private userRedisRepository: IUserRedisRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger,
    @inject(TYPES.OAuth2Client) private oauth2Client: OAuth2Client
  ) {}

  async execute(idToken: string): Promise<UseCaseResponse<User>> {
    const tokenPayload = await verifyIdTokenAndGetPayload(
      this.oauth2Client,
      idToken
    );

    if (!tokenPayload) {
      this.logger.error("Failed to verify id token");
      return {
        error: "Failed to verify id token",
        data: null,
      };
    }

    const { email, family_name, given_name, picture, userId } = tokenPayload;

    // Check if the email is existed in the database
    const foundUser = await this.userRepository.findUserByEmail(email);

    // If the user does not exist, create new federated credential user.
    if (!foundUser.value) {
      const user = await User.create({
        email,
        firstName: family_name,
        lastName: given_name,
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
