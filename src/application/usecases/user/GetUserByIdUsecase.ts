import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { IGetUserByIdUsecase } from "@domain/usecases/user";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class GetUserByIdUsecase implements IGetUserByIdUsecase {
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(id: string): Promise<UseCaseResponse<User>> {
    const result = await this.userRepository.getUserById(id);

    if (result.error) {
      this.logger.error(result.error.message);
      return {
        data: null,
        error: result.error.message,
      };
    }

    return { data: result.value };
  }
}
