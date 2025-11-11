import { IMessageEventPublisher } from "@domain/events";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { DEFAULT_TTL } from "@shared/constants";
import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";
import { UpdateUserPresenseRequest } from "./update-user-presense.request";
import { UpdateUserPresenseResponse } from "./update-user-presense.response";
import { IUpdateUserPresenseUseCase } from "./update-user-presense.usecase";

@injectable()
export class UpdateUserPresenseUseCase implements IUpdateUserPresenseUseCase {
  constructor(
    @inject(TYPES.RedisClient)
    private readonly redisClient: RedisClientType,

    @inject(TYPES.MessagePublisher)
    private readonly publisher: IMessageEventPublisher
  ) {}

  async execute(
    request: UpdateUserPresenseRequest
  ): Promise<UpdateUserPresenseResponse> {
    try {
      const { userId, isOnline, lastSeenAt } = request;
      const now = lastSeenAt || new Date().toISOString();
      const key = `user-presence:${userId}`;
      const exists = await this.redisClient.exists(key);

      if (!!exists) {
        await this.redisClient.hSet(key, {
          isOnline: isOnline ? "true" : "false",
          lastSeenAt: now,
        });
      } else {
        await this.redisClient.hSet(key, {
          userId,
          isOnline: isOnline ? "true" : "false",
          lastSeenAt: now,
        });
      }

      await this.redisClient.expire(key, DEFAULT_TTL);
      await this.publisher.publishPresenseUpdate({ userId, isOnline });

      return { data: true };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to update user presense",
      };
    }
  }
}
