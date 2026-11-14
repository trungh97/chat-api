import {
  IUserPresenceReader,
  IUserPresenceStore,
  OnlineUserPresence,
} from "@domain/cache";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import {
  PRESENCE_TTL_SECONDS,
  USER_PRESENCE_KEY_PREFIX,
  userPresenceKey,
} from "@shared/constants";
import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

@injectable()
export class UserPresenceRedisRepository
  implements IUserPresenceReader, IUserPresenceStore
{
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

  async findOnlineUsers(): Promise<OnlineUserPresence[]> {
    // SCAN walks the keyspace in small steps, so it doesn't block Redis the way KEYS does.
    // It may return a key more than once, hence the Set.
    const uniqueKeys = new Set<string>();
    for await (const key of this.redisClient.scanIterator({
      MATCH: `${USER_PRESENCE_KEY_PREFIX}*`,
      COUNT: 100,
    })) {
      uniqueKeys.add(key);
    }
    if (uniqueKeys.size === 0) return [];
    const keys = [...uniqueKeys];

    const pipeline = this.redisClient.multi();
    keys.forEach((key) => pipeline.hGetAll(key));
    const replies = await pipeline.execAsPipeline();

    return keys.reduce<OnlineUserPresence[]>((onlineUsers, key, index) => {
      if (readField(replies[index], "isOnline") === "true") {
        onlineUsers.push({
          userId: key.slice(USER_PRESENCE_KEY_PREFIX.length),
          lastSeenAt: toDate(readField(replies[index], "lastSeenAt")),
        });
      }
      return onlineUsers;
    }, []);
  }

  async markOffline(userId: string): Promise<void> {
    const key = UserPresenceRedisRepository.createKey(userId);

    await this.redisClient.hSet(key, { isOnline: "false" });
    // If the key expired after it was read, HSET has just recreated it with no TTL.
    await this.redisClient.expire(key, PRESENCE_TTL_SECONDS);
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

/** Parses a stored ISO time. Returns `null` when it is missing or not a valid date. */
const toDate = (value: string | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
