import { inject, injectable } from "inversify";

import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import {
  ILoginCredentialBasedUserRequestDTO,
  ILoginCredentialBasedUserUseCase,
} from "@domain/usecases/user/credential-based";
import { TYPES } from "@infrastructure/external/di/inversify";
import { IUserRedisRepository } from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { comparePassword } from "@shared/utils/jwt";

@injectable()
export class LoginCredentialBasedUserUseCase
  implements ILoginCredentialBasedUserUseCase
{
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserRedisRepository)
    private userRedisRepository: IUserRedisRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    request: ILoginCredentialBasedUserRequestDTO
  ): Promise<UseCaseResponse<User>> {
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
