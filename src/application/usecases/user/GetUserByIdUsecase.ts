import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { IGetUserByIdUsecase } from "@domain/usecases/user";
import { TYPES } from "@infrastructure/external/di/inversify";
import { IUserRedisRepository, UserRedisRepository } from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class GetUserByIdUsecase implements IGetUserByIdUsecase {
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserRedisRepository)
    private userRedisRepository: IUserRedisRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(id: string): Promise<UseCaseResponse<User>> {
    // Find the user in the cache first
    const sessionId = UserRedisRepository.createKey(id);
    const cacheData = await this.userRedisRepository.getUserById(sessionId);

    if (cacheData.value) {
      return {
        data: cacheData.value,
      };
    }

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
