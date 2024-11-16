import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

import { TYPES } from "@infrastructure/external/di/inversify";
import { User } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

export interface IUserRedisRepository {
  getUserById(id: string): Promise<RepositoryResponse<User, Error>>;

  setUser(user: User, ttl?: number): Promise<void>;

  deleteUserById(id: string): Promise<void>;
}

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

  static createKey(id: string): string {
    return `user:${id}`;
  }

  async getUserById(id: string): Promise<RepositoryResponse<User, Error>> {
    try {
      const cachedData = await this.redisClient.get(id);

      if (!cachedData) {
        return {
          error: new Error("User not found"),
          value: null,
        };
      }

      const user = JSON.parse(cachedData);

      return {
        value: new User({
          id: user._id,
          email: user._email,
          firstName: user._firstName,
          lastName: user._lastName,
          phone: user._phone,
          role: user._role,
          avatar: user._avatar,
          isActive: user._isActive,
          status: user._status,
          provider: user._provider,
          providerUserId: user._providerUserId,
        }),
      };
    } catch (error) {
      return {
        error: error.message,
        value: null,
      };
    }
  }

  async setUser(user: User, ttl = 3600): Promise<void> {
    try {
      const sessionKey = UserRedisRepository.createKey(user.id);
      await this.redisClient.set(sessionKey, JSON.stringify(user), {
        EX: ttl,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUserById(sessionKey: string): Promise<void> {
    try {
      await this.redisClient.del(sessionKey);
      return;
    } catch (error) {
      throw error;
    }
  }
}
