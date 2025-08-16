import { IMessagePublisher } from "@application/ports";
import { Conversation, Message } from "@domain/entities";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { pubSub } from "./connection";
import { Topic } from "./topics";
import { MessageWithConversation } from "./types";

@injectable()
export class RedisMessagePublisher implements IMessagePublisher {
  constructor(@inject(TYPES.WinstonLogger) private logger: ILogger) {}

  async publishNewMessage(payload: {
    message: Message;
    sender: {
      name: string;
      avatar: string;
    };
    conversation: Conversation;
  }): Promise<void> {
    try {
      const { message, sender, conversation } = payload;
      const data = new MessageWithConversation(
        message,
        conversation,
        sender.name,
        sender.avatar
      );

      await pubSub.publish(Topic.NEW_MESSAGE, data);
    } catch (error) {
      this.logger.error(`Error publishing new message: ${error}`);
    }
  }
}
