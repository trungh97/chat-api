import { IUserPresenceReader } from "@domain/cache";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { userPresenceKey } from "@shared/constants";
import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

@injectable()
export class UserPresenceRedisRepository implements IUserPresenceReader {
  constructor(
    @inject(TYPES.RedisClient) private redisClient: RedisClientType
  ) {}

  static createKey(userId: string): string {
    return userPresenceKey(userId);
  }

  async getOnlineStatusByUserIds(
    userIds: string[]
  ): Promise<Record<string, boolean>> {
    if (userIds.length === 0) return {};

    // One round trip for the whole page instead of one HGETALL per user.
    const pipeline = this.redisClient.multi();
    userIds.forEach((userId) =>
      pipeline.hGetAll(UserPresenceRedisRepository.createKey(userId))
    );
    const replies = await pipeline.execAsPipeline();

    return userIds.reduce<Record<string, boolean>>((statuses, userId, index) => {
      statuses[userId] = readField(replies[index], "isOnline") === "true";
      return statuses;
    }, {});
  }
}

/**
 * Reads one field of an HGETALL reply. `execAsPipeline` already turns each reply into
 * an object, but node-redis types pipeline replies loosely, so check the shape.
 */
const readField = (reply: unknown, field: string): string | undefined => {
  if (reply && typeof reply === "object") {
    const value = (reply as Record<string, unknown>)[field];
    return value === undefined ? undefined : String(value);
  }
  return undefined;
};
