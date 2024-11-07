import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

import { TYPES } from "@infrastructure/persistence/di/inversify";
import { User } from "@domain/entities";

import { IUserRedisRepository } from "../types/UserRedisRepository";
import { RepositoryResponse } from "@shared/responses";

@injectable()
export class UserRedisRepository implements IUserRedisRepository {
  /**
   * Create an instance of UserRedisRepository
   *
   * @param {RedisClientType} redisClient - The redis client instance
   */
  constructor(
    @inject(TYPES.RedisClient) private redisClient: RedisClientType
  ) {}

  getMe(): Promise<RepositoryResponse<User, Error>> {
    return Promise.reject(new Error("Not implemented"));
  }

  saveUser(user: User): Promise<RepositoryResponse<User, Error>> {
    return Promise.reject(new Error("Not implemented"));
  }
}
