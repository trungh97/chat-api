import { createClient } from "redis";

const redisClient = createClient({
  database: process.env.REDIS_DATABASE as unknown as number,
});

export { redisClient };
