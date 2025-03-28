import Redis from "ioredis";
import { createPubSub } from "@graphql-yoga/subscription";
import { createRedisEventTarget } from "@graphql-yoga/redis-event-target";
import { ConversationType } from "@domain/enums";

// TODO: Refactor this file
export const enum Topic {
  NEW_CONVERSATION = "NEW_CONVERSATION",
}
export type NewConversationPayload = {
  id: string;

  title: string;

  creatorId: string;

  isArchived: boolean;

  deletedAt: Date;

  type: ConversationType;
};

const options = {
  db: process.env.REDIS_DATABASE as unknown as number,
  retryStrategy: (times) => Math.max(times * 100, 3000),
};

export const pubSub = createPubSub<{
  [Topic.NEW_CONVERSATION]: [NewConversationPayload];
}>({
  eventTarget: createRedisEventTarget({
    publishClient: new Redis(options),
    subscribeClient: new Redis(options),
  }),
});
