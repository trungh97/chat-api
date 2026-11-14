import { TYPES } from "@infrastructure/external/di/inversify/types";
import { PRESENCE_TTL_SECONDS, userPresenceKey } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

import { HeartbeatUserPresenseRequest } from "./heartbeat-user-presense.request";
import { HeartbeatUserPresenseResponse } from "./heartbeat-user-presense.response";
import { IHeartbeatUserPresenseUseCase } from "./heartbeat-user-presense.usecase";
import { IMessageEventPublisher } from "@domain/events";

@injectable()
export class HeartbeatUserPresenseUseCase
  implements IHeartbeatUserPresenseUseCase
{
  constructor(
    @inject(TYPES.RedisClient)
    private readonly redisClient: RedisClientType,

    @inject(TYPES.WinstonLogger)
    private readonly logger: ILogger,

    @inject(TYPES.MessagePublisher)
    private readonly messagePublisher: IMessageEventPublisher
  ) {}

  async execute(
    request: HeartbeatUserPresenseRequest
  ): Promise<HeartbeatUserPresenseResponse> {
    try {
      const { userId } = request;
      const key = userPresenceKey(userId);
      const now = new Date();
      const wasOnline =
        (await this.redisClient.hGet(key, "isOnline")) === "true";

      if (wasOnline) {
        await this.redisClient.hSet(key, { lastSeenAt: now.toISOString() });
      } else {
        await this.redisClient.hSet(key, {
          userId,
          isOnline: "true",
          lastSeenAt: now.toISOString(),
        });
      }

      await this.redisClient.expire(key, PRESENCE_TTL_SECONDS);

      if (!wasOnline) {
        // The key was missing, or the user was marked offline while still here (a late
        // heartbeat, or another tab disconnecting). Tell subscribers they are back.
        await this.messagePublisher.publishPresenseUpdate({
          userId,
          isOnline: true,
          lastSeenAt: now,
        });
      }

      return {
        data: true,
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update user presence heartbeat";
      this.logger.error(message);
      return {
        data: null,
        error: message,
      };
    }
  }
}
