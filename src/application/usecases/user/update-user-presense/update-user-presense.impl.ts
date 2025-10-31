import { IMessageEventPublisher } from "@domain/events";
import { TYPES } from "@infrastructure/external/di/inversify/types";
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

      await this.redisClient.hSet(`presense:${userId}`, {
        isOnline: isOnline ? "true" : "false",
        lastSeenAt: now,
      });

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
