import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import {
  IUserRedisRepository,
  UserRedisRepository,
} from "@infrastructure/persistence/repositories/user";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetUserByIdRequest } from "./get-user-by-id.request";
import { GetUserByIdResponse } from "./get-user-by-id.response";
import { IGetUserByIdUsecase } from "./get-user-by-id.usecase";

@injectable()
export class GetUserByIdUsecase implements IGetUserByIdUsecase {
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserRedisRepository)
    private userRedisRepository: IUserRedisRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute({ id }: GetUserByIdRequest): Promise<GetUserByIdResponse> {
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
