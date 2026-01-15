import IORedis from "ioredis";

export const bullConnection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DATABASE) || 1,
  maxRetriesPerRequest: null,
});
