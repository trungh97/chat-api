import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { IUserRedisRepository } from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { comparePassword } from "@shared/utils/jwt";
import { inject, injectable } from "inversify";
import { LoginCredentialBasedUserRequest } from "./login-user.request";
import { LoginCredentialBasedUserResponse } from "./login-user.response";
import { ILoginCredentialBasedUserUseCase } from "./login-user.usecase";

@injectable()
export class LoginCredentialBasedUserUseCase
  implements ILoginCredentialBasedUserUseCase
{
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserRedisRepository)
    private userRedisRepository: IUserRedisRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    request: LoginCredentialBasedUserRequest
  ): Promise<LoginCredentialBasedUserResponse> {
    try {
      const existingUser = await this.userRepository.findUserByEmail(
        request.email
      );

      if (existingUser.error) {
        return {
          data: null,
          error: "Invalid credentials",
        };
      }

      const isValidPassword = await comparePassword(
        request.password,
        existingUser.value.password
      );

      if (!isValidPassword) {
        return {
          data: null,
          error: "Invalid credentials",
        };
      }

      await this.userRedisRepository.setUser(existingUser.value);

      return {
        data: existingUser.value,
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        data: null,
        error: error.message,
      };
    }
  }
}
