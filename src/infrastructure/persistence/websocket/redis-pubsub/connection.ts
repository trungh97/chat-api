import { createRedisEventTarget } from "@graphql-yoga/redis-event-target";
import { createPubSub } from "@graphql-yoga/subscription";
import Redis from "ioredis";
import { PubSubProps } from "./types";

const options = {
  db: process.env.REDIS_DATABASE as unknown as number,
  retryStrategy: (times) => Math.max(times * 100, 3000),
};

export const pubSub = createPubSub<PubSubProps>({
  eventTarget: createRedisEventTarget({
    publishClient: new Redis(options),
    subscribeClient: new Redis(options),
  }),
});
