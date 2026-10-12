import { IMessageEventPublisher } from "@domain/events";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import cron from "node-cron";
import { RedisClientType } from "redis";

const redisClient = container.get<RedisClientType>(TYPES.RedisClient);
const publisher = container.get<IMessageEventPublisher>(TYPES.MessagePublisher);

export async function cleanupExpiredPresence() {
  const now = Date.now();

  const keys = await redisClient.keys("user-presense:*");

  if (keys.length === 0) return;

  for (const key of keys) {
    const data = await redisClient.hGetAll(key);
    if (!data?.lastSeenAt) continue;

    const lastSeen = new Date(data.lastSeenAt).getTime();
    const diff = now - lastSeen;

    if (diff > 3 * 60 * 1_000) {
      // mark offline
      const userId = key.split(":")[1];

      await redisClient.hSet(key, {
        userId,
        isOnline: "false",
        lastSeenAt: new Date().toISOString(),
      });

      // publish event
      await publisher.publishPresenseUpdate({
        userId,
        isOnline: false,
      });
    }
  }
}

export function scheduleCleanUpPresence() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("[Scheduler] Running job to clean up user presence status...");
    await cleanupExpiredPresence();
  });
}
