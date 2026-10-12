import { createClient, RedisClientType } from "redis";

const redisClient: RedisClientType = createClient({
  database: process.env.REDIS_DATABASE as unknown as number,
});

export { redisClient };
