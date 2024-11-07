import { inject, injectable } from "inversify";

import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { IRegisterUserUseCase } from "@domain/usecases/user";
import { TYPES } from "@infrastructure/persistence/di/inversify";
import { ILogger } from "@infrastructure/persistence/logger";
import { UseCaseResponse } from "@shared/responses";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    request: ICreateUserRequestDTO
  ): Promise<UseCaseResponse<User>> {
    const user = await User.create(request);
    const result = await this.userRepository.createUser(user);

    if (result.error) {
      this.logger.error(result.error.message);
      return {
        data: null,
        error: result.error.message,
      };
    }

    return {
      data: result.value,
    };
  }
}
