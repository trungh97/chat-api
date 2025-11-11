import { TYPES } from "@infrastructure/external/di/inversify/types";
import { DEFAULT_TTL } from "@shared/constants";
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
      const key = `user-presence:${userId}`;
      const exists = await this.redisClient.exists(key);

      if (!!exists) {
        await this.redisClient.hSet(key, {
          lastSeenAt: new Date().toISOString(),
        });
      } else {
        await this.redisClient.hSet(key, {
          userId,
          isOnline: "true",
          lastSeenAt: new Date().toISOString(),
        });
      }

      this.redisClient
        .expire(key, DEFAULT_TTL)
        .then((isExpired) => {
          if (!isExpired) {
            this.messagePublisher.publishPresenseUpdate({
              userId,
              isOnline: false,
            });
          }
        });

      return {
        data: true,
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        data: null,
        error: error.message || "Failed to update user presence heartbeat",
      };
    }
  }
}
