import {
  IMessageEventPublisher,
  PublishMessageSentPayload,
  PublishMessageStatusUpdatedPayload,
} from "@domain/events";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { pubSub } from "./connection";
import { Topic } from "./topics";
import { MessageWithConversation } from "./types";

@injectable()
export class RedisMessagePublisher implements IMessageEventPublisher {
  constructor(@inject(TYPES.WinstonLogger) private logger: ILogger) {}

  async publishMessageSent(payload: PublishMessageSentPayload): Promise<void> {
    try {
      const { message, sender, conversation } = payload;
      const data = new MessageWithConversation(
        message,
        conversation,
        sender.name,
        sender.avatar
      );

      await pubSub.publish(Topic.NEW_MESSAGE_SENT, data);
    } catch (error) {
      this.logger.error(`Error publishing new message: ${error}`);
    }
  }

  async publishMessageStatusUpdated(
    payload: PublishMessageStatusUpdatedPayload
  ): Promise<void> {
    try {
      await pubSub.publish(Topic.MESSAGE_STATUS_UPDATED, payload);
    } catch (error) {
      this.logger.error(`Error publishing message status update: ${error}`);
    }
  }
}
