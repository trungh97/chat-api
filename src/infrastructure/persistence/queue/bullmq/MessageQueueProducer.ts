import { Message } from "@domain/entities";
import { MessageStatus } from "@domain/enums";
import { IMessageQueueProducer } from "@domain/queue";
import { Queue } from "bullmq";
import { injectable } from "inversify";
import { bullConnection } from "./connection";

@injectable()
export class MessageQueueProducer implements IMessageQueueProducer {
  private readonly queue = new Queue("message-queue", {
    connection: bullConnection,
  });

  async enqueuePersistMessage(message: Message): Promise<void> {
    await this.queue.add("persist-message", message, {
      attempts: 3,
      backoff: { type: "exponential", delay: 500 },
    });
  }

  async enqueueMessageStatusUpdate(
    messageId: string,
    status: keyof typeof MessageStatus
  ): Promise<void> {
    await this.queue.add(
      "message-status-update",
      { messageId, status },
      { removeOnComplete: true }
    );
  }
}
