import { IUserPresenceReader } from "@domain/cache";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

@injectable()
export class UserPresenceRedisRepository implements IUserPresenceReader {
  constructor(
    @inject(TYPES.RedisClient) private redisClient: RedisClientType
  ) {}

  static createKey(userId: string): string {
    return `user-presence:${userId}`;
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
 * Reads one field of an HGETALL reply. node-redis types pipeline replies as raw, so
 * accept both the parsed object form and the flat `[field, value, ...]` form.
 */
const readField = (reply: unknown, field: string): string | undefined => {
  if (Array.isArray(reply)) {
    const index = reply.findIndex((item, i) => i % 2 === 0 && item === field);
    return index === -1 ? undefined : String(reply[index + 1]);
  }
  if (reply && typeof reply === "object") {
    const value = (reply as Record<string, unknown>)[field];
    return value === undefined ? undefined : String(value);
  }
  return undefined;
};
